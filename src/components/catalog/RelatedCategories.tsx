import clsx from 'clsx';
import { categories } from '../../data/categories';
import type { CategoryId } from '../../types';

interface RelatedCategoriesProps {
  activeCategory: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}

export function RelatedCategories({ activeCategory, onSelect }: RelatedCategoriesProps) {
  const related = activeCategory
    ? categories.filter((c) => c.id !== activeCategory)
    : categories;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4 m-0">Related Categories</h2>
      <div className="flex flex-wrap gap-2">
        {related.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-colors',
              activeCategory === cat.id
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-surface text-text-secondary border-border hover:border-brand-red hover:text-brand-red',
            )}
          >
            {cat.name}
            <span className="font-mono text-xs ml-2 opacity-70">({cat.itemCount})</span>
          </button>
        ))}
      </div>
    </section>
  );
}
