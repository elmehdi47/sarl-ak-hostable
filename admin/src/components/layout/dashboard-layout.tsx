import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Folders, Mail, LogOut, Armchair, ShoppingBag, Images } from "lucide-react";
import { useAdminLogout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminLanguage } from "@/hooks/use-admin-language";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language, setLanguage, isRTL } = useAdminLanguage();

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
        toast({ title: t("loggedOut") });
      },
      onError: () => {
        toast({ title: t("logoutFailed"), variant: "destructive" });
      }
    }
  });

  const navItems = [
    { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
    { href: "/dashboard/products", label: t("products"), icon: Package },
    { href: "/dashboard/categories", label: t("categories"), icon: Folders },
    { href: "/dashboard/inquiries", label: t("inquiries"), icon: Mail },
    { href: "/dashboard/orders", label: t("orders"), icon: ShoppingBag },
    { href: "/dashboard/site-images", label: t("siteImages"), icon: Images },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col fixed inset-y-0 start-0 z-30 text-sidebar-foreground">
        <div className="p-5 flex items-center gap-3 font-serif font-bold text-xl text-primary border-b border-sidebar-border/50">
          <Armchair className="h-6 w-6 flex-shrink-0" />
          <span>{t("sarlAk")}</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                  isRTL ? "flex-row-reverse text-right" : "",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-center gap-1 rounded-full bg-sidebar-accent/40 p-1">
            {(["ar", "fr", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "flex-1 py-1 rounded-full text-xs font-bold uppercase transition-all",
                  language === lang
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border/50">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent gap-2",
              isRTL ? "flex-row-reverse" : ""
            )}
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden md:ms-64">
        {/* Mobile Header */}
        <header className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-lg text-primary">
            <Armchair className="h-5 w-5" />
            <span>{t("sarlAk")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full bg-sidebar-accent/40 p-0.5">
              {(["ar", "fr", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all",
                    language === lang
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-sidebar-foreground/70"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => logoutMutation.mutate()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
