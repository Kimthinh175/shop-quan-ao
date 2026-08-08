import { ApiClient } from "../../api/ApiClient";
import { IArticle } from "../interfaces/IPost";
import { IPaginationResponse } from "../interfaces/ITypes";

export interface FetchPostsParams {
  limit?: number;
  cursor?: string;
  search?: string;
  sort?: string;
}

export class PostService {
  async fetchPosts(params: FetchPostsParams = {}): Promise<IPaginationResponse<IArticle>> {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.search?.trim()) qs.set("search", params.search.trim());
    if (params.sort) qs.set("sort", params.sort);

    const query = qs.toString();
    return ApiClient.get<IPaginationResponse<IArticle>>(`/posts${query ? `?${query}` : ""}`);
  }

  async fetchPostBySlug(slug: string): Promise<IArticle | null> {
    try {
      return await ApiClient.get<IArticle>(`/posts/slug/${encodeURIComponent(slug)}`);
    } catch {
      return null;
    }
  }
}

export function formatArticleDate(article: IArticle): string {
  const raw = article.published_at || article.createdAt;
  if (!raw) return "";
  return new Date(raw).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function articleThumbnail(article: IArticle): string {
  return (
    article.thumbnail ||
    "https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&w=800"
  );
}
