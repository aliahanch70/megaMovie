export interface ProductLink {
  id?: number;
  product_id?: number;
  title: string;
  url: string;
  price: number;
}

export interface ProductSpecification {
  id?: number;
  product_id?: number;
  category: string;
  label: string;
  value: string;
}

export interface Product {
  specifications?: ProductSpecification[];
}