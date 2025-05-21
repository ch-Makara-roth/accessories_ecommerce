
export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  description: string;
  image: string;
  category: string;
  type?: string; // e.g., "Wireless", "Wired"
  color?: string;
  material?: string;
  offer?: string; // e.g., "50% Off"
  tags?: string[];
  dataAiHint?: string;
};

export type Category = {
  id: string;
  name: string;
  icon?: React.ElementType;
  slug: string;
};

export interface CartItem {
  product: Product;
  quantity: number;
}
