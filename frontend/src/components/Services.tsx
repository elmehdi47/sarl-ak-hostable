import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import { useLocation } from "wouter";
import { useListCategories } from "@/lib/api";
import { getLucideIcon } from "@/lib/icon-map";

const COLOR_SCHEMES = [
  { bg: "from-orange-50 to-orange-100", border: "border-orange-200", iconBg: "bg-secondary" },
  { bg: "from-sky-50 to-blue-100", border: "border-blue-200", iconBg: "bg-sky-500" },
  { bg: "from-slate-100 to-gray-200", border: "border-gray-200", iconBg: "bg-primary" },
  { bg: "from-emerald-50 to-green-100", border: "border-green-200", iconBg: "bg-emerald-600" },
  { bg: "from-violet-50 to-purple-100", border: "border-purple-200", iconBg: "bg-violet-600" },
  { bg: "from-rose-50 to-pink-100", border: "border-pink-200", iconBg: "bg-rose-500" },
];

export function Services() {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const { data: categories, isLoading } = useListCategories();

  const cats: any[] = Array.isArray(categories) ? categories : [];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{t("ourServices")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg">{t("servicesDesc")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 ${cats.length === 1 ? "max-w-md mx-auto" : cats.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {cats.map((cat, index) => {
              const scheme = COLOR_SCHEMES[index % COLOR_SCHEMES.length];
              const Icon = getLucideIcon(cat.iconName);
              const name =
                language === "ar" ? cat.nameAr :
                language === "fr" ? cat.nameFr :
                cat.nameEn;
              const desc =
                language === "ar" ? cat.descriptionAr :
                language === "fr" ? cat.descriptionFr :
                cat.descriptionEn;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className={`rounded-2xl flex flex-col items-center text-center p-8 h-full bg-gradient-to-br ${scheme.bg} border ${scheme.border} transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                    <div className={`w-20 h-20 ${scheme.iconBg} rounded-2xl flex items-center justify-center text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={44} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-primary mb-3">{name}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-1">{desc}</p>
                    <div className={`flex items-center gap-2 text-sm font-semibold text-secondary group-hover:gap-3 transition-all ${language === "ar" ? "flex-row-reverse" : ""}`}>
                      <span>{t("discover")}</span>
                      <ArrowRight size={16} className={language === "ar" ? "rotate-180" : ""} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
