import { PostsRepository } from './posts.repository';
import { Post, PostWithCounts, CreatePostDto, UpdatePostDto } from './posts.types';

export class PostsService {
  constructor(private repository: PostsRepository) {}

  async getPosts(limit: number = 10, offset: number = 0): Promise<PostWithCounts[]> {
    return await this.repository.findAll(limit, offset);
  }

  async getPostById(id: number): Promise<PostWithCounts | null> {
    return await this.repository.findById(id);
  }

  async createPost(postData: CreatePostDto): Promise<Post> {
    return await this.repository.create(postData);
  }

  async updatePost(id: number, postData: UpdatePostDto, userId: number): Promise<Post | null> {
    const hasPermission = await this.repository.checkOwnership(id, userId);
    if (!hasPermission) {
      throw new Error('해당 게시글을 수정할 권한이 없습니다.');
    }
    return await this.repository.update(id, postData);
  }

  async deletePost(id: number, userId: number): Promise<boolean> {
    const hasPermission = await this.repository.checkOwnership(id, userId);
    if (!hasPermission) {
      throw new Error('해당 게시글을 삭제할 권한이 없습니다.');
    }
    return await this.repository.delete(id);
  }

  async toggleLike(postId: number, userId: number): Promise<{ liked: boolean }> {
    const isLiked = await this.repository.checkLike(userId, postId);

    if (isLiked) {
      await this.repository.removeLike(userId, postId);
      return { liked: false };
    } else {
      await this.repository.addLike(userId, postId);
      return { liked: true };
    }
  }
}
