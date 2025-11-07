import { CommentRepository } from '../repositories/index.js';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
  CommentListResponseDto,
  CommentQueryDto,
} from '../dto/index.js';
import { NotificationService } from './notification.service.js';
import { ArticleRepository } from '../repositories/index.js';
import { Server } from 'socket.io';

export class CommentService {
  private notificationService: NotificationService;
  private articleRepository: ArticleRepository;

  constructor(
    private commentRepository: CommentRepository,
    articleRepository?: ArticleRepository,
  ) {
    this.notificationService = new NotificationService();
    this.articleRepository = articleRepository || new ArticleRepository(this.commentRepository['prisma']);
  }

  async createComment(
    commentData: CreateCommentDto,
    io?: Server,
  ): Promise<CommentResponseDto> {
    if (!commentData.productId && !commentData.articleId) {
      throw new Error('상품 ID 또는 게시글 ID가 필요합니다.');
    }

    if (commentData.productId && commentData.articleId) {
      throw new Error('상품 댓글과 게시글 댓글을 동시에 생성할 수 없습니다.');
    }

    const comment = await this.commentRepository.create(commentData);

    // If comment is on an article, notify the article author
    if (io && commentData.articleId) {
      const article = await this.articleRepository.findById(commentData.articleId);

      if (article && article.userId !== commentData.userId) {
        const message = `회원님의 게시글 "${article.title}"에 새로운 댓글이 달렸습니다.`;

        await this.notificationService.createNotification(io, {
          userId: article.userId,
          type: 'COMMENT',
          message,
          articleId: commentData.articleId,
          commentId: comment.id,
        });
      }
    }

    return comment;
  }

  async getCommentById(id: number): Promise<CommentResponseDto | null> {
    return await this.commentRepository.findById(id);
  }

  async getProductComments(
    productId: number,
    query: CommentQueryDto,
  ): Promise<CommentListResponseDto> {
    const result = await this.commentRepository.findByProductId(
      productId,
      query,
    );
    return {
      list: result.comments,
      totalCount: result.totalCount,
    };
  }

  async getArticleComments(
    articleId: number,
    query: CommentQueryDto,
  ): Promise<CommentListResponseDto> {
    const result = await this.commentRepository.findByArticleId(
      articleId,
      query,
    );
    return {
      list: result.comments,
      totalCount: result.totalCount,
    };
  }

  async updateComment(
    id: number,
    commentData: UpdateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    const hasPermission = await this.commentRepository.checkOwnership(
      id,
      userId,
    );
    if (!hasPermission) {
      throw new Error('해당 댓글을 수정할 권한이 없습니다.');
    }

    return await this.commentRepository.update(id, commentData);
  }

  async deleteComment(id: number, userId: number): Promise<void> {
    const hasPermission = await this.commentRepository.checkOwnership(
      id,
      userId,
    );
    if (!hasPermission) {
      throw new Error('해당 댓글을 삭제할 권한이 없습니다.');
    }

    await this.commentRepository.delete(id);
  }
}
