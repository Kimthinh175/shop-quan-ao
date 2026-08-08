import { IProductVariant } from "../interfaces/ITypes";

export interface IProduct {
  id: number;
  _id?: number;
  name: string;
  price: number;
  default_price?: number;
  image: string;
  main_img?: string;
  category?: string | any;
  category_id?: number | any;
  brand?: string;
  description?: string;
  isNew?: boolean;
  variants?: IProductVariant[];
  images?: string[];
  status?: string;
}
