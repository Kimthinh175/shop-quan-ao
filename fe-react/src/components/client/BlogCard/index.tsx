import Link from "next/link";

export interface BlogCardProps {
    href?: string;
    image: string;
    category: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
}






export default function BlogCard({
    href = "/post-detail",
    image,
    category,
    title,
    excerpt,
    date,
    readTime
}: BlogCardProps) {
    return (
        <article className="group cursor-pointer article-card">
            <Link href={href}>
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden mb-8 rounded-2xl">
                    <img 
                        src={image} 
                        className="w-full h-full object-cover transition-all duration-[1500ms] ease-out" 
                        alt={title} 
                    />
                </div>
                <span className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.3em] mb-4 block">
                    {category}
                </span>
                <h3 className="font-serif text-2xl font-black mb-4 italic group-hover:text-indigo-600 transition-all leading-snug">
                    {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                    {excerpt}
                </p>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>{date}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{readTime}</span>
                </div>
            </Link>
        </article>
    );
}
