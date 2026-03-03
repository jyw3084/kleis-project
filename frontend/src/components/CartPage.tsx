import { useCart } from '../cart/useCart';
import { useUpsellSuggestion } from '../upsell/useUpsellSuggestion';
import { useFrequentlyBoughtTogether } from '../upsell/useFrequentlyBoughtTogether';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { UpsellCard } from './UpsellCard';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';

const productById = new Map(MOCK_PRODUCTS.map((p) => [p.id, p]));

export function CartPage() {
  const {
    lineItems,
    cartSubtotal,
    cartProductIds,
    addToCart,
    removeFromCart,
  } = useCart();
  const { suggestedProduct, gap, message } = useUpsellSuggestion(
    MOCK_PRODUCTS,
    cartSubtotal,
    cartProductIds
  );
  const frequentlyBoughtTogether = useFrequentlyBoughtTogether(
    MOCK_PRODUCTS,
    cartProductIds
  );

  return (
    <main data-testid="cart-page" className="cart-page-layout">
      <aside className="cart-page-panel cart-page-panel--catalog" aria-label="Product catalog">
        <h2>Catalog</h2>
        <ul data-testid="catalog-list">
          {MOCK_PRODUCTS.map((p) => (
            <li key={p.id}>
              <span>{p.title}</span>
              <span>${p.price.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => addToCart(p.id, 1, p.price)}
                data-testid={`add-${p.id}`}
              >
                Add to cart
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="cart-page-panel cart-page-panel--cart" aria-label="Shopping cart">
        <h1>Cart</h1>

        {lineItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <ul data-testid="cart-line-items">
            {lineItems.map((item) => {
              const product = productById.get(item.productId);
              return (
                <li key={item.productId} data-testid={`cart-line-${item.productId}`}>
                  <span>{product?.title ?? item.productId}</span>
                  <span>${item.price.toFixed(2)}</span>
                  <span>× {item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label={`Remove ${product?.title ?? item.productId}`}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p data-testid="cart-subtotal">
          Subtotal: ${cartSubtotal.toFixed(2)}
        </p>
        {lineItems.length > 0 && (
          <p data-testid="free-shipping-message">{message}</p>
        )}
        
        {lineItems.length > 0 && frequentlyBoughtTogether.length > 0 && gap > 0 && (
          <FrequentlyBoughtTogether
            products={frequentlyBoughtTogether}
            onAddToCart={addToCart}
          />
        )}
        {lineItems.length > 0 && frequentlyBoughtTogether.length === 0 && gap > 0 && suggestedProduct && (
          <UpsellCard
            suggestedProduct={suggestedProduct}
            message={message}
            onAddToCart={addToCart}
          />
        )}
      </section>
    </main>
  );
}
