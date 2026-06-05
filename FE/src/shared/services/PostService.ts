import { IPost } from "../interfaces/IPost";

export class PostService {
  private mockPosts: IPost[] = [
    {
      id: 1,
      title: "L'Essentiel Fall/Winter 2026",
      excerpt:
        "Khám phá sự giao thoa giữa nghệ thuật cổ điển và phong cách tối giản hiện đại trong bộ sưu tập mới nhất.",
      content: "Nội dung chi tiết về bộ sưu tập mùa đông...",
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200",
      category: "Collection",
      date: "10/05/2026",
      author: "Closet Team",
      featured: true,
    },
    {
      id: 2,
      title: "Nghệ thuật phối đồ Quiet Luxury",
      excerpt:
        "Làm thế nào để mặc đẹp mà không cần logo phô trương? Bí quyết nằm ở chất liệu và phom dáng.",
      content: "Nội dung hướng dẫn phối đồ...",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
      category: "Blog",
      date: "08/05/2026",
      author: "Fashion Editor",
    },
    {
      id: 3,
      title: "Serene Summer: Giao hưởng của vải Linen",
      excerpt:
        "Bộ sưu tập dành cho những chuyến đi xa, nhẹ nhàng và tự do như làn gió mùa hè.",
      content: "Nội dung chi tiết về bộ sưu tập hè...",
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200",
      category: "Collection",
      date: "05/05/2026",
      author: "Closet Team",
    },
  ];

  private apiUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  async fetchPosts(): Promise<IPost[]> {
    try {
      const response = await fetch(`${this.apiUrl}/posts`);
      if (!response.ok) return this.mockPosts;
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Lỗi fetchPosts:", error);
      return this.mockPosts;
    }
  }

  async fetchPostById(id: number): Promise<IPost | null> {
    try {
      const response = await fetch(`${this.apiUrl}/posts/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Lỗi fetchPostById:", error);
      return null;
    }
  }
}
