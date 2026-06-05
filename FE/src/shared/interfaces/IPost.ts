export interface IPost {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: 'Collection' | 'Blog' | 'Trends';
    date: string;
    author: string;
    featured?: boolean;
}
