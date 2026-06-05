export interface IProduct {
  id: number;
  _id?: number;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  description?: string;
  isNew?: boolean;
  variants?: any[];
}
