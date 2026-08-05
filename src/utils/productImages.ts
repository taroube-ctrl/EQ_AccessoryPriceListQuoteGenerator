import type { Product } from '../types';

export type ProductImageFamily =
  | 'cabinet'
  | 'rack-pdu'
  | 'updu'
  | 'pdu-input-cable'
  | 'basket-tray'
  | 'fiber-tray'
  | 'ladder-rack'
  | 'patch-panel'
  | 'fiber-module'
  | 'media-converter'
  | 'bracket'
  | 'cable-management'
  | 'blanking-panel'
  | 'copper-module'
  | 'cabinet-accessory'
  | 'cage-accessory';

const FAMILY_FILES: Record<ProductImageFamily, string> = {
  cabinet: 'cabinet.png',
  'rack-pdu': 'rack-pdu.png',
  updu: 'updu.png',
  'pdu-input-cable': 'pdu-input-cable.png',
  'basket-tray': 'basket-tray.png',
  'fiber-tray': 'fiber-tray.png',
  'ladder-rack': 'ladder-rack.png',
  'patch-panel': 'patch-panel.png',
  'fiber-module': 'fiber-module.png',
  'media-converter': 'media-converter.png',
  bracket: 'bracket.png',
  'cable-management': 'cable-management.png',
  'blanking-panel': 'blanking-panel.png',
  'copper-module': 'copper-module.png',
  'cabinet-accessory': 'cabinet-accessory.png',
  'cage-accessory': 'cage-accessory.png',
};

function productSearchText(product: Product): string {
  return `${product.name} ${product.description} ${product.partNumber ?? ''} ${product.purpose ?? ''}`.toLowerCase();
}

function productCoreText(product: Product): string {
  return `${product.name} ${product.description} ${product.partNumber ?? ''}`.toLowerCase();
}

/** Map a catalog product to a representative image family. */
export function getProductImageFamily(product: Product): ProductImageFamily {
  const text = productSearchText(product);
  const core = productCoreText(product);

  if (/input cable|updu input/.test(core)) return 'pdu-input-cable';
  if (/\bupdu\b|u pdu/.test(core) && /pdu/.test(core)) return 'updu';
  if (/rpdu|r pdu|\bpdu\b|power distribution/.test(core)) return 'rack-pdu';

  if (/basket tray|cable basket/.test(core)) return 'basket-tray';
  if (/fiber tray/.test(core)) return 'fiber-tray';
  if (/ladder rack|copper tray|suspended ladder/.test(core)) return 'ladder-rack';
  if (/patch panel|1ru|3ru panel/.test(core)) return 'patch-panel';
  if (/cassette|mpo|fiber module/.test(core)) return 'fiber-module';
  if (/copper module|keystone|rj45 module/.test(core)) return 'copper-module';
  if (/media convert|omnitron|planet|converter|transceiver/.test(core)) {
    return 'media-converter';
  }

  if (/blanking|filler panel/.test(core)) return 'blanking-panel';
  if (/\bbracket\b|\brail\b|srhold|holdbrk/.test(core)) return 'bracket';
  // Match cable managers on name/description only — purpose text often says "cable management".
  if (/cable manag|cable finger|finger duct|vertical manager|horizontal manager/.test(core)) {
    return 'cable-management';
  }

  if (/cabinet|enxtl|rack enclosure|server rack|enclosure/.test(core)) {
    if (!/\bbracket\b|\brail\b|blanking|filler panel|finger duct/.test(core)) {
      return 'cabinet';
    }
  }

  if (product.categoryId === 'power-accessories') return 'rack-pdu';
  if (product.categoryId === 'cross-connect-accessories') return 'media-converter';
  if (product.categoryId === 'cage-accessories') return 'cage-accessory';
  if (product.categoryId === 'cabinet-accessories') {
    // Depth extenders and similar enclosure add-ons still read as cabinets in purpose text.
    if (/extender|enclosure|cabinet/.test(text)) return 'cabinet';
    return 'cabinet-accessory';
  }

  return 'cabinet-accessory';
}

function familyImagePath(family: ProductImageFamily): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}images/products/${FAMILY_FILES[family]}`;
}

/**
 * Resolve the display image for a product.
 * Prefer an explicit `imageUrl` when present; otherwise use family mapping.
 */
export function getProductImageUrl(product: Product): string {
  const explicit = product.imageUrl?.trim();
  if (explicit) {
    if (/^https?:\/\//i.test(explicit) || explicit.startsWith('/')) return explicit;
    const base = import.meta.env.BASE_URL || '/';
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return `${normalized}${explicit.replace(/^\//, '')}`;
  }

  return familyImagePath(getProductImageFamily(product));
}
