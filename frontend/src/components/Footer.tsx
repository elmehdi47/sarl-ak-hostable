import { useLanguage } from "@/hooks/use-language";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useListCategories } from "@/lib/api";
import { useContactInfo } from "@/hooks/use-contact-info";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();
  const [location, setLocation] = useLocation();
  const { data: categories } = useListCategories();
  const cats: any[] = Array.isArray(categories) ? categories : [];
  const contactInfo = useContactInfo();
  const phoneRaw = contactInfo.contact_phone.replace(/\s+/g, "");

  const logoSrc = `${import.meta.env.BASE_URL}logo.jpg`;

  const goToSection = (id: string) => {
    const isHome = location === "/" || location === "";
    if (isHome) {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = `${BASE}/#${id}`;
    }
  };

  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src={logoSrc} alt="SARL AK logo" className="h-12 w-12 object-contain rounded-full bg-white p-0.5" />
              <div>
                <div className="font-bold text-xl tracking-wide">
                  SARL <span className="text-secondary">AK</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">Algerienne Lil Maktabia</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {t("heroSubtitle")}
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-6 relative inline-block">
              {t("quickLinks")}
              <span className="absolute -bottom-2 start-0 w-1/2 h-0.5 bg-secondary" />
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: t("home"), id: "home" },
                { label: t("services"), id: "services" },
                { label: t("about"), id: "about" },
                { label: t("contact"), id: "contact" },
              ].map(({ label, id }) => (
                <li key={id}>
                  <button
                    onClick={() => goToSection(id)}
                    className="text-white/70 hover:text-secondary transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-6 relative inline-block">
              {t("services")}
              <span className="absolute -bottom-2 start-0 w-1/2 h-0.5 bg-secondary" />
            </h3>
            <ul className="space-y-3 text-sm">
              {cats.map((cat) => {
                const name =
                  language === "ar" ? cat.nameAr :
                  language === "fr" ? cat.nameFr :
                  cat.nameEn;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => setLocation(`/category/${cat.slug}`)}
                      className="text-white/70 hover:text-secondary transition-colors"
                    >
                      {name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-6 relative inline-block">
              {t("contact")}
              <span className="absolute -bottom-2 start-0 w-1/2 h-0.5 bg-secondary" />
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin size={16} className="text-secondary shrink-0 mt-0.5" />
                <span>{contactInfo.contact_address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-secondary shrink-0" />
                <a href={`tel:${phoneRaw}`} dir="ltr" className="text-white/70 hover:text-secondary transition-colors">
                  {contactInfo.contact_phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-secondary shrink-0" />
                <a href={`mailto:${contactInfo.contact_email}`} className="text-white/70 hover:text-secondary transition-colors break-all">
                  {contactInfo.contact_email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">
          <p>&copy; {year} SARL AK — Algerienne Lil Maktabia. {t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}
