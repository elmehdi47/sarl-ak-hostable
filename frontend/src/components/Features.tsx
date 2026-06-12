import { useLanguage } from "@/hooks/use-language";
import { Award, Hammer, Gem } from "lucide-react";

export function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Award size={32} className="text-secondary" />,
      title: t("quality"),
      desc: t("qualityDesc")
    },
    {
      icon: <Hammer size={32} className="text-secondary" />,
      title: t("craftsmanship"),
      desc: t("craftsmanshipDesc")
    },
    {
      icon: <Gem size={32} className="text-secondary" />,
      title: t("design"),
      desc: t("designDesc")
    }
  ];

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t("whyChooseUs")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif font-medium mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
