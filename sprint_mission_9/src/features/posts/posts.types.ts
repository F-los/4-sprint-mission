export interface Post {
  id: number;
  board_id: number;
  author_id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostWithCounts extends Post {
  author_nickname?: string;
  like_count: number;
  comment_count: number;
}

export interface CreatePostDto {
  board_id?: number;
  author_id: number;
  title: string;
  content: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}
