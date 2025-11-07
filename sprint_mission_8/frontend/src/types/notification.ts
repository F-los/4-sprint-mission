// src/types/notification.ts
export interface Notification {
  id: number;
  type: 'PRICE_CHANGE' | 'COMMENT';
  message: string;
  isRead: boolean;
  createdAt: string;
  productId?: number;
  articleId?: number;
  commentId?: number;
}
