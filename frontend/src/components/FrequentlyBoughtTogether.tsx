import type { MockProduct } from '../data/mockProducts';

interface FrequentlyBoughtTogetherProps {
  products: MockProduct[];
  onAddToCart: (productId: string, quantity: number, price: number) => void;
}

export function FrequentlyBoughtTogether({
  products,
  onAddToCart,
}: FrequentlyBoughtTogetherProps) {
  if (products.length === 0) return null;

  return (
    <section
      data-testid="frequently-bought-together"
      aria-label="Frequently bought together"
    >
      <h2>Frequently bought together</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt=""
                width={64}
                height={64}
              />
            )}
            <span>{p.title}</span>
            <span>${p.price.toFixed(2)}</span>
            <button
              type="button"
              onClick={() => onAddToCart(p.id, 1, p.price)}
            >
              Add to cart
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
