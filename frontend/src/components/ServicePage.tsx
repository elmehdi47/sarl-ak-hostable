import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import { useListCategories } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useCart } from "@/contexts/CartContext";
import { getLucideIcon } from "@/lib/icon-map";
import { useContactInfo } from "@/hooks/use-contact-info";

const BANNER_SCHEMES = [
  { banner: "bg-gradient-to-br from-orange-50 to-orange-100 border-b border-orange-200", iconBg: "bg-secondary" },
  { banner: "bg-gradient-to-br from-sky-50 to-blue-100 border-b border-blue-200", iconBg: "bg-sky-500" },
  { banner: "bg-gradient-to-br from-slate-100 to-gray-200 border-b border-gray-200", iconBg: "bg-primary" },
  { banner: "bg-gradient-to-br from-emerald-50 to-green-100 border-b border-green-200", iconBg: "bg-emerald-600" },
  { banner: "bg-gradient-to-br from-violet-50 to-purple-100 border-b border-purple-200", iconBg: "bg-violet-600" },
  { banner: "bg-gradient-to-br from-rose-50 to-pink-100 border-b border-pink-200", iconBg: "bg-rose-500" },
];

interface ServicePageProps {
  categorySlug: string;
}

function ProductCard({ product, language }: { product: any; language: string }) {
  const { addItem } = useCart();
  const { t } = useLanguage();

  const name =
    language === "ar" ? product.nameAr :
    language === "fr" ? product.nameFr :
    product.nameEn;
  const description =
    language === "ar" ? product.descriptionAr :
    language === "fr" ? product.descriptionFr :
    product.descriptionEn;
  const image: string | null = product.imageUrl || null;
  const price: number = product.price ?? 0;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      nameAr: product.nameAr,
      imageUrl: image,
      price,
    });
    toast.success(t("addedToCart"), { description: name });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 group flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl text-gray-200">🛋</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-serif font-bold text-primary mb-2">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3">
          {price > 0 ? (
            <span className="text-secondary font-bold text-base">
              {price.toLocaleString()} {t("dzd")}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">{t("priceOnRequest")}</span>
          )}
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            <ShoppingCart size={15} />
            {t("addToCart")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const PRODUCTS_PER_PAGE = 12;

function usePaginatedProducts(categoryId: number | undefined) {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    if (!categoryId) return;
    if (append) setIsLoadingMore(true); else setIsLoading(true);
    try {
      const params = new URLSearchParams({
        categoryId: String(categoryId),
        page: String(pageNum),
        limit: String(PRODUCTS_PER_PAGE),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.products) {
        setProducts(prev => append ? [...prev, ...data.products] : data.products);
        setTotalPages(data.totalPages ?? 1);
        setPage(pageNum);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
    setIsLoadingMore(false);
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      setProducts([]);
      setPage(1);
      fetchPage(1, false);
    }
  }, [categoryId, fetchPage]);

  const loadMore = useCallback(() => {
    if (page < totalPages) fetchPage(page + 1, true);
  }, [page, totalPages, fetchPage]);

  return { products, isLoading, isLoadingMore, hasMore: page < totalPages, loadMore };
}

export function ServicePage({ categorySlug }: ServicePageProps) {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const { contact_whatsapp } = useContactInfo();

  const { data: categories } = useListCategories();
  const cats: any[] = Array.isArray(categories) ? categories : [];
  const catIndex = cats.findIndex((c: any) => c.slug === categorySlug);
  const category = catIndex >= 0 ? cats[catIndex] : undefined;

  const scheme = BANNER_SCHEMES[(catIndex >= 0 ? catIndex : 0) % BANNER_SCHEMES.length];
  const Icon = getLucideIcon(category?.iconName);

  const { products, isLoading, isLoadingMore, hasMore, loadMore } = usePaginatedProducts(category?.id);

  const categoryName =
    language === "ar" ? category?.nameAr :
    language === "fr" ? category?.nameFr :
    category?.nameEn;

  const categoryDesc =
    language === "ar" ? category?.descriptionAr :
    language === "fr" ? category?.descriptionFr :
    category?.descriptionEn;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <div className={`${scheme.banner} py-20 px-4 text-center`}>
          <div className="container mx-auto">
            <div className={`w-16 h-16 ${scheme.iconBg} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}>
              <Icon size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              {categoryName || "..."}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {categoryDesc}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors mb-10 ${language === "ar" ? "flex-row-reverse" : ""}`}
          >
            <ArrowLeft size={16} className={language === "ar" ? "rotate-180" : ""} />
            {t("backHome")}
          </button>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-10 text-center">
            {t("productsTitle")}
          </h2>

          {isLoading || !category ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg mb-6">{t("noProducts")}</p>
              <a
                href={`https://wa.me/${contact_whatsapp}?text=Hello%2C%20I'm%20interested%20in%20${categorySlug}%20furniture`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={18} />
                {t("contactWhatsApp")}
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} language={language} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isLoadingMore && <Loader2 size={18} className="animate-spin" />}
                    {t("loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
