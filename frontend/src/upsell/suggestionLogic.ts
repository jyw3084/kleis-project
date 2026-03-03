import type { MockProduct } from '../data/mockProducts';

export function computeGap(
  threshold: number,
  cartSubtotal: number
): number {
  if (cartSubtotal >= threshold) return 0;
  return threshold - cartSubtotal;
}

export function filterCandidates(products: MockProduct[]): MockProduct[] {
  return products.filter((p) => p.availableForSale);
}

export function scoreProduct(
  productId: string,
  cartProductIds: string[],
  boughtTogetherSets: string[][]
): 1 | 2 | 3 {
  const cartSet = new Set(cartProductIds);
  let best = 1 as 1 | 2 | 3;
  for (const set of boughtTogetherSets) {
    if (!set.includes(productId)) continue;
    const othersInSet = set.filter((id) => id !== productId);
    const inCart = othersInSet.filter((id) => cartSet.has(id));
    if (inCart.length === 0) continue;
    if (inCart.length === othersInSet.length) {
      best = 3; // candidate completes the set
      break;
    }
    best = 2; // candidate is in set with at least one cart product
  }
  return best;
}

export function pickBestCandidate(
  products: MockProduct[],
  cartProductIds: string[],
  boughtTogetherSets: string[][],
  margins: Record<string, number>,
  clearanceProductIds: string[],
  gap: number
): MockProduct | null {
  // Fast path: if gap is 0 or negative, no product should be suggested
  if (gap <= 0) return null;

  // Filter out products that are not available for sale
  const candidates = filterCandidates(products);
  if (candidates.length === 0) return null;

  const clearanceSet = new Set(clearanceProductIds);
  // Fast path: if any candidates have price > gap, pick the cheapest among them (tie-break: prefer clearance)
  const aboveGap = candidates.filter((p) => p.price > gap);
  if (aboveGap.length > 0) {
    return aboveGap.reduce((best, p) => {
      if (p.price < best.price) return p;
      if (p.price > best.price) return best;
      return clearanceSet.has(p.id) ? p : best;
    });
  }
  
  // Score products based on their bought-together affinity, clearance status, and price
  const scored = candidates.map((p) => {
    const baseScore = scoreProduct(p.id, cartProductIds, boughtTogetherSets); // Score product based on its bought-together affinity
    const clearanceBonus = clearanceSet.has(p.id) ? 2 : 0; // Add bonus points if product is on clearance
    const totalScore = baseScore + (p.price >= gap ? 1 : 0) + clearanceBonus; // Calculate total score based on base score, price, and clearance bonus
    return { product: p, score: totalScore };
  });

  const maxScore = Math.max(...scored.map((s) => s.score)); // Find the product with the highest score
  const topByScore = scored.filter((s) => s.score === maxScore); // Filter products to only include those with the highest score
  if (topByScore.length === 1) return topByScore[0]!.product; // If there is only one product with the highest score, return it
  
  // Tie-break: score 1 → min price
  if (maxScore === 1) {
    let best = topByScore[0]!;
    for (let i = 1; i < topByScore.length; i++) {
      const curr = topByScore[i]!;
      if (curr.product.price < best.product.price) best = curr;
    }
    return best.product;
  }

  // Tie-break: score >= 2 → highest margin
  let best = topByScore[0]!;
  for (let i = 1; i < topByScore.length; i++) {
    const curr = topByScore[i]!;
    const currMargin = margins[curr.product.id] ?? 0;
    const bestMargin = margins[best.product.id] ?? 0;
    if (currMargin > bestMargin) best = curr;
  }
  return best.product;
}

export function getFrequentlyBoughtTogetherIds(
  cartProductIds: string[],
  boughtTogetherSets: string[][]
): string[] {
  const cartSet = new Set(cartProductIds);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const set of boughtTogetherSets) {
    const cartHasFromSet = set.some((id) => cartSet.has(id));
    if (!cartHasFromSet) continue;
    for (const id of set) {
      if (cartSet.has(id) || seen.has(id)) continue;
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

export function getUpsellMessage(gap: number): string {
  if (gap <= 0) return "You've unlocked free shipping";
  return `You're $${gap.toFixed(0)} away from free shipping`;
}
