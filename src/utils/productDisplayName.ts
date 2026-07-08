import type { Product } from '../types';
import { DEFAULT_DISPLAY_UNIT, type DisplayUnit, type ProductDimensions } from '../types/dimensions';
import { formatMm, formatRackUnits, formatTextWithDisplayUnits } from './dimensions';

export function isCabinetProduct(product: Product): boolean {
  return product.categoryId === 'cabinet-accessories' && /^cabinet$/i.test(product.name.trim());
}

export function parseProductDimensionsFromDescription(
  description: string,
): ProductDimensions | undefined {
  const text = String(description ?? '');

  const fullMatch = text.match(/(\d+)U[xX](\d+)x(\d+)/i);
  if (fullMatch) {
    return {
      rackUnits: Number(fullMatch[1]),
      widthMm: Number(fullMatch[2]),
      depthMm: Number(fullMatch[3]),
    };
  }

  const mmWidthMatch = text.match(/(\d+)U[xX](\d+)mm/i);
  if (mmWidthMatch) {
    return {
      rackUnits: Number(mmWidthMatch[1]),
      widthMm: Number(mmWidthMatch[2]),
    };
  }

  const partialMatch = text.match(/(\d+)U[xX](\d+)/i);
  if (partialMatch) {
    return {
      rackUnits: Number(partialMatch[1]),
      widthMm: Number(partialMatch[2]),
    };
  }

  const bareMatch = text.match(/(\d+)x(\d+)x(\d+)/i);
  if (bareMatch) {
    return {
      rackUnits: Number(bareMatch[1]),
      widthMm: Number(bareMatch[2]),
      depthMm: Number(bareMatch[3]),
    };
  }

  return undefined;
}

/** @deprecated Use parseProductDimensionsFromDescription */
export const parseCabinetDimensionsFromDescription = parseProductDimensionsFromDescription;

export function resolveProductDimensions(product: Product): ProductDimensions | undefined {
  if (product.dimensions) return product.dimensions;
  return parseProductDimensionsFromDescription(product.description);
}

export function formatProductDimensionsLabel(
  dimensions: ProductDimensions,
  displayUnit: DisplayUnit,
): string {
  const parts = [formatRackUnits(dimensions.rackUnits)];

  if (dimensions.widthMm != null) {
    parts.push(`${formatMm(dimensions.widthMm, displayUnit)}W`);
  }
  if (dimensions.depthMm != null) {
    parts.push(`${formatMm(dimensions.depthMm, displayUnit)}D`);
  }

  return parts.join(' × ');
}

function replaceCabinetDimensionPatterns(text: string, displayUnit: DisplayUnit): string {
  return text
    .replace(
      /(\d+(?:-\d+)?U)[xX](\d+)x(\d+)(mm)?(\w*)/gi,
      (_match, rackPart, widthMm, depthMm, _mmSuffix, suffix) => {
        const w = formatMm(Number(widthMm), displayUnit);
        const d = formatMm(Number(depthMm), displayUnit);
        return `${rackPart} × ${w}W × ${d}D${suffix}`;
      },
    )
    .replace(/(\d+(?:-\d+)?U)[xX](\d+)mm(\w*)/gi, (_match, rackPart, widthMm, suffix) => {
      const w = formatMm(Number(widthMm), displayUnit);
      return `${rackPart} × ${w}W${suffix}`;
    })
    .replace(
      /(\d+)U?[xX](\d+)x(\d+)(mm)?(\w*)/gi,
      (_match, rackUnits, widthMm, depthMm, _mmSuffix, suffix) => {
        const w = formatMm(Number(widthMm), displayUnit);
        const d = formatMm(Number(depthMm), displayUnit);
        return `${rackUnits}U × ${w}W × ${d}D${suffix}`;
      },
    );
}

/** Rewrites embedded measurements in catalog labels to the active display unit. */
export function formatDescriptionWithDisplayUnits(
  description: string,
  displayUnit: DisplayUnit,
): string {
  const text = String(description ?? '');
  return formatTextWithDisplayUnits(replaceCabinetDimensionPatterns(text, displayUnit), displayUnit);
}

export function getProductDisplayName(
  product: Product,
  displayUnit: DisplayUnit = DEFAULT_DISPLAY_UNIT,
): string {
  const dimensions = resolveProductDimensions(product);

  if (isCabinetProduct(product) && dimensions) {
    return `${product.name} · ${formatProductDimensionsLabel(dimensions, displayUnit)}`;
  }

  return formatDescriptionWithDisplayUnits(product.name, displayUnit);
}