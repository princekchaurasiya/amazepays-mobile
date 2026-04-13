import type { Product } from '@/types/models';

export function getProductTitle(p: Product): string {
  return (
    p.product_name ||
    p.name ||
    p.brandName ||
    p.sku ||
    'Gift card'
  );
}

export function getListImageUrl(p: Product): string | undefined {
  return (
    p.resolved_image_url ||
    p.resolved?.image_url ||
    undefined
  );
}

export function parsePrice(v: unknown): number {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

export function isOutOfStock(p: Product): boolean {
  return p.out_of_stock === true;
}
