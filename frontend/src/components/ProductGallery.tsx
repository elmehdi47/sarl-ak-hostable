import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useListProducts, useListCategories } from "@/lib/api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGallery() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: products, isLoading: loadingProducts } = useListProducts(
    activeCategory ? { categoryId: activeCategory } : undefined
  );

  return (
    <section id="products" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{t("featuredProducts")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeCategory === null
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:bg-primary/5"
            }`}
          >
            {t("allCategories")}
          </button>
          
          {loadingCategories ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-24 h-10 rounded-full" />
            ))
          ) : (
            categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-white text-muted-foreground hover:bg-primary/5"
                }`}
              >
                {category.name}
              </button>
            ))
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingProducts ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="w-full aspect-[4/3] rounded-t-xl" />
                <div className="bg-white p-6 rounded-b-xl border border-t-0 border-border">
                  <Skeleton className="w-2/3 h-6 mb-2" />
                  <Skeleton className="w-1/3 h-4" />
                </div>
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-border"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col grow">
                  <h3 className="font-serif text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 grow">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto">
                    <span className="text-sm font-semibold tracking-wider text-secondary uppercase">
                      {product.category?.name}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-muted-foreground">
              No products found for this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
