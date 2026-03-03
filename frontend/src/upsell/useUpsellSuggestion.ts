import type { MockProduct } from '../data/mockProducts';
import {
  FREE_SHIPPING_THRESHOLD,
  CLEARANCE_PRODUCT_IDS,
  BOUGHT_TOGETHER_SETS,
  PRODUCT_MARGINS,
} from '../data/upsellData';
import {
  computeGap,
  pickBestCandidate,
  getUpsellMessage,
} from './suggestionLogic';

export interface UpsellSuggestionResult {
  suggestedProduct: MockProduct | null;
  gap: number;
  message: string;
}

export function useUpsellSuggestion(
  products: MockProduct[],
  cartSubtotal: number,
  cartProductIds: string[]
): UpsellSuggestionResult {
  const gap = computeGap(FREE_SHIPPING_THRESHOLD, cartSubtotal);
  const suggestedProduct =
    gap > 0
      ? pickBestCandidate(
          products,
          cartProductIds,
          BOUGHT_TOGETHER_SETS,
          PRODUCT_MARGINS,
          CLEARANCE_PRODUCT_IDS,
          gap
        )
      : null;
  const message = getUpsellMessage(gap);
  return { suggestedProduct, gap, message };
}
