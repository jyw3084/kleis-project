export interface MockProduct {
  id: string;
  title: string;
  price: number;
  availableForSale: boolean;
  imageUrl?: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'p1', title: 'Wireless Earbuds', price: 29.99, availableForSale: true },
  { id: 'p2', title: 'Phone Stand', price: 19.99, availableForSale: true },
  { id: 'p3', title: 'USB-C Cable Pack', price: 14.99, availableForSale: true },
  { id: 'p4', title: 'Desk Organizer', price: 34.99, availableForSale: true },
  { id: 'p5', title: 'Lamp LED Desk', price: 44.99, availableForSale: true },
  { id: 'p6', title: 'Notebook Set', price: 12.99, availableForSale: true },
  { id: 'p7', title: 'Water Bottle', price: 24.99, availableForSale: true },
  { id: 'p8', title: 'Laptop Sleeve', price: 39.99, availableForSale: true },
  { id: 'p9', title: 'Keycap Set', price: 49.99, availableForSale: true },
  { id: 'p10', title: 'Monitor Arm', price: 59.99, availableForSale: true },
  { id: 'p11', title: 'Standing Desk', price: 79.99, availableForSale: true },
];
