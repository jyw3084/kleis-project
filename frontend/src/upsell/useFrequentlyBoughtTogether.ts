import type { MockProduct } from '../data/mockProducts';
import { BOUGHT_TOGETHER_SETS } from '../data/upsellData';
import { getFrequentlyBoughtTogetherIds } from './suggestionLogic';

export function useFrequentlyBoughtTogether(
  products: MockProduct[],
  cartProductIds: string[]
): MockProduct[] {
  const ids = getFrequentlyBoughtTogetherIds(cartProductIds, BOUGHT_TOGETHER_SETS);
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is MockProduct => p != null && p.availableForSale);
}
