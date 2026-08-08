export interface Product {
    _id: number | string;
    id?: number | string;
    name: string;
    description?: string;
    default_price: number;
    price?: number;
    main_img?: string;
    images?: string[];
    rate?: number;
    review_count?: number;
    status?: string;
    category?: { _id: number | string; name: string; slug?: string }[];
    variants?: {
        color_hex: string;
        color: string;
        price: number;
        size?: string;
        quantity?: number;
    }[];
}
