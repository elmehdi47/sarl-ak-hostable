import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Menu, X, LogIn, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { totalItems, openCart } = useCart();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // On non-home pages the background is light, so always use the dark style
  const isHome = location === "/" || location === "";
  const isScrolled = !isHome || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    // Reset on route change
    setScrolled(false);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const navigateTo = (id: string) => {
    setMobileMenuOpen(false);
    const isHome = location === "/" || location === "" || location === BASE + "/" || location === BASE;
    if (isHome) {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage with a hash so it scrolls after load
      window.location.href = `${BASE}/#${id}`;
    }
  };

  const navLinks = [
    { label: t("home"), id: "home" },
    { label: t("services"), id: "services" },
    { label: t("about"), id: "about" },
    { label: t("contact"), id: "contact" },
  ];

  const logoSrc = `${import.meta.env.BASE_URL}logo.jpg`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex-shrink-0 cursor-pointer flex items-center gap-2"
          onClick={() => navigateTo("home")}
        >
          <img
            src={logoSrc}
            alt="SARL AK logo"
            className="h-11 w-11 object-contain rounded-full bg-white shadow-sm p-0.5"
          />
          <div className="leading-tight">
            <div className={`font-bold text-base md:text-lg tracking-wide ${isScrolled ? "text-gray-900" : "text-white drop-shadow"}`}>
              SARL <span className="text-secondary">AK</span>
            </div>
            <div className={`text-[9px] uppercase tracking-widest hidden md:block ${isScrolled ? "text-gray-500" : "text-white/70"}`}>
              Algerienne Lil Maktabia
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-7 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => navigateTo(link.id)}
                  className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-secondary ${
                    isScrolled ? "text-gray-700" : "text-white/90"
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className={`flex items-center gap-1 rounded-full px-1 py-1 border ${isScrolled ? "border-gray-200 bg-gray-50" : "border-white/20 bg-black/10 backdrop-blur-sm"}`}>
              {(["ar", "fr", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-8 h-7 rounded-full text-xs font-bold uppercase transition-all ${
                    language === lang
                      ? "bg-secondary text-white shadow"
                      : isScrolled
                      ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className={`relative flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                isScrolled
                  ? "border-gray-300 text-gray-700 hover:border-secondary hover:text-secondary"
                  : "border-white/40 text-white hover:border-white hover:bg-white/10"
              }`}
            >
              <ShoppingCart size={14} />
              <span className="hidden lg:inline">{t("cart")}</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Admin Login */}
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                isScrolled
                  ? "border-gray-300 text-gray-700 hover:border-secondary hover:text-secondary"
                  : "border-white/40 text-white hover:border-white hover:bg-white/10"
              }`}
            >
              <LogIn size={14} />
              <span className="hidden lg:inline">{t("login")}</span>
            </a>
          </div>
        </nav>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {(["ar", "fr", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-7 h-7 rounded-full text-[10px] font-bold uppercase transition-all ${
                  language === lang
                    ? "bg-secondary text-white shadow"
                    : isScrolled
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-white/80 hover:bg-white/20"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            onClick={openCart}
            className={`relative p-1.5 ${isScrolled ? "text-gray-700" : "text-white"}`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 ${isScrolled ? "text-gray-700" : "text-white"}`}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t">
          <ul className="flex flex-col px-6 py-2">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => navigateTo(link.id)}
                  className="block w-full text-start text-base font-medium text-gray-800 py-3 border-b border-gray-100 hover:text-secondary transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li className="py-3">
              <a
                href="http://localhost:5174"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary font-medium"
              >
                <LogIn size={16} />
                {t("login")}
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
