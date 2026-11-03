export const images = {
  wetMarket: '/images/wet-market-kk.webp',
  produce: '/images/produce-market.webp',
  greens: '/images/market-greens.webp',
  seafood: '/images/seafood-market.webp',
  poultry: '/images/poultry-market.webp',
  dryGoods: '/images/dry-goods-market.webp',
} as const;

const byCategory: Record<string, string> = {
  'Poultry & meat': images.poultry,
  Seafood: images.seafood,
  Produce: images.produce,
  'Dairy & eggs': images.greens,
  'Dry goods': images.dryGoods,
  'Sauces & condiments': images.dryGoods,
};

export const supplierImage = (categories: string[]): string => {
  for (const category of categories) {
    const image = byCategory[category];
    if (image) return image;
  }
  return images.dryGoods;
};
