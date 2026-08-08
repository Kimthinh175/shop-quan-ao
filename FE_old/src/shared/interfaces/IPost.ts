export type ArticleStatus = "draft" | "published" | "archived";

export interface IArticle {
  _id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  author_id?: number;
  status: ArticleStatus;
  published_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** @deprecated Use IArticle */
export type IPost = IArticle;
