import { categoryMap } from '../../data/categories';
import { useCatalog } from '../../context/CatalogContext';
import type { CategoryId } from '../../types';

interface EditorialBlockProps {
  categoryId: CategoryId | null;
}

export function EditorialBlock({ categoryId }: EditorialBlockProps) {
  const { countryName, region, regionLabel, locale } = useCatalog();

  const title = categoryId
    ? categoryMap[categoryId].name
    : 'Data Center Accessories & Infrastructure';

  const body = categoryId
    ? categoryMap[categoryId].description
    : `Browse our complete catalog of data center accessories, power solutions, cross-connect hardware, and professional installation services — curated for ${countryName} (${region}).`;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-extrabold mb-4 m-0 text-text">{title}</h2>
      <p className="text-text-muted leading-relaxed max-w-3xl m-0">{body}</p>
      <p className="text-text-muted leading-relaxed max-w-3xl mt-4 m-0">
        Your {regionLabel} team provides local warranty coverage and {locale.currency} pricing.
      </p>
    </section>
  );
}
