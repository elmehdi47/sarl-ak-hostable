import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import craftsmanImg from "@/assets/about-craftsman.png";
import { motion } from "framer-motion";

export function About() {
  const { t } = useLanguage();

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const aboutImg = settings?.about_image || craftsmanImg;

  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute inset-0 bg-secondary/10 translate-x-4 translate-y-4 rounded-xl"></div>
            <img 
              src={aboutImg}
              alt="SARL AK craftsmanship - Meuble AK Bordj Bou Arréridj" 
              className="relative z-10 w-full h-auto rounded-xl object-cover shadow-lg"
            />
            <div className="absolute -bottom-8 -right-8 bg-white p-6 shadow-xl rounded-lg z-20 border border-border hidden md:block">
              <p className="text-4xl font-serif font-bold text-secondary mb-1">25+</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Years of Excellence</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">{t("aboutUs")}</h2>
            <div className="w-16 h-1 bg-secondary mb-8"></div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t("aboutText1")}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("aboutText2")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
