import type { MockProduct } from '../data/mockProducts';

interface UpsellCardProps {
  suggestedProduct: MockProduct;
  message: string;
  onAddToCart: (productId: string, quantity: number, price: number) => void;
}

export function UpsellCard({
  suggestedProduct,
  onAddToCart,
}: UpsellCardProps) {
  return (
    <section data-testid="upsell-card" aria-label="Free shipping upsell">
      <p>Add {suggestedProduct.title} to get free shipping</p>
      <div>
        {suggestedProduct.imageUrl && (
          <img
            src={suggestedProduct.imageUrl}
            alt=""
            width={64}
            height={64}
          />
        )}
        <span>{suggestedProduct.title}</span>
        <span>${suggestedProduct.price.toFixed(2)}</span>
        <button
          type="button"
          onClick={() =>
            onAddToCart(suggestedProduct.id, 1, suggestedProduct.price)
          }
        >
          Add to cart
        </button>
      </div>
    </section>
  );
}
