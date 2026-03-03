// Should be converted to backend later: free shipping threshold from config/API
export const FREE_SHIPPING_THRESHOLD = 75;

// Should be converted to backend later: clearance list from backend
export const CLEARANCE_PRODUCT_IDS: string[] = ['p4', 'p5', 'p8', 'p9', 'p10', 'p11'];

// Should be converted to backend later: bought-together from orders API
/** Sets of product IDs often bought together; if cart has one or more from a set, others in the set get a score boost; "complete the set" gets highest score */
export const BOUGHT_TOGETHER_SETS: string[][] = [
  ['p1', 'p2', 'p3'],
  ['p4', 'p5'],
  ['p8', 'p9'],
];

// Should be converted to backend later: margins from backend or Admin API
export const PRODUCT_MARGINS: Record<string, number> = {
  p4: 8,
  p5: 12,
  p8: 10,
  p9: 15,
  p10: 14,
  p11: 18,
};
