import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { ChevronRight, ChevronLeft } from "lucide-react";

import hero1 from "@/assets/hero-1.png";
import hero2 from "@/assets/hero-2.png";
import hero3 from "@/assets/hero-3.png";

const fallbackImages = [hero1, hero2, hero3];

export function Hero() {
  const { t, language } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: language === "ar" ? "rtl" : "ltr" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const slides = [
    { id: 1, image: settings?.hero_1 || fallbackImages[0] },
    { id: 2, image: settings?.hero_2 || fallbackImages[1] },
    { id: 3, image: settings?.hero_3 || fallbackImages[2] },
  ];

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 6000);
    
    return () => {
      clearInterval(autoplay);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative h-screen min-h-[600px] w-full overflow-hidden bg-primary">
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%] h-full w-full min-w-0">
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={slide.image}
                alt={`SARL AK furniture showroom - Meuble AK Bordj Bou Arréridj ${slide.id}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h2 className="text-secondary font-serif text-lg md:text-xl font-medium tracking-widest uppercase mb-4">
              SARL AK Furniture
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white rounded-none px-8 py-6 text-lg h-auto"
                onClick={() => scrollTo("services")}
              >
                {t("exploreCollection")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary rounded-none px-8 py-6 text-lg h-auto"
                onClick={() => scrollTo("contact")}
              >
                {t("contactUs")}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 transition-all duration-300 rounded-full ${
              selectedIndex === index ? "w-8 bg-secondary" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
      
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm hidden md:block"
        onClick={() => emblaApi?.scrollPrev()}
      >
        {language === "ar" ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
      </button>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm hidden md:block"
        onClick={() => emblaApi?.scrollNext()}
      >
        {language === "ar" ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
      </button>
    </section>
  );
}
