export interface IProductVariant {
    _id?: number;
    id?: number;
    product_id: number;
    sku: string;
    size: string;
    color: string;
    price: number;
    quantity?: number;
    sold?: number;
}

export interface IPaginationResponse<T> {
    results: T[];
    limit: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
}

export interface IFilterOption {
    id?: number;
    _id?: number;
    name: string;
    code?: string;
    count?: number;
}

export interface IFilterOptionsResponse {
    categories: IFilterOption[];
    brands: IFilterOption[];
    seasons: IFilterOption[];
    genders: IFilterOption[];
    materials: IFilterOption[];
    forms: IFilterOption[];
    sports: IFilterOption[];
    sizes: string[];
    colors: string[];
}
