import { useListProducts, useListCategories, useListInquiries } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Folders, Mail, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLanguage } from "@/hooks/use-admin-language";
import { useState, useEffect } from "react";

const API_BASE = "";

function useTotalOrders() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch(`${API_BASE}/api/orders`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setCount(data.length))
      .catch(() => setCount(0));
  }, []);
  return count;
}

export default function DashboardOverview() {
  const { t } = useAdminLanguage();
  const { data: products, isLoading: isLoadingProducts } = useListProducts();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: inquiries, isLoading: isLoadingInquiries } = useListInquiries();
  const totalOrders = useTotalOrders();

  const stats = [
    {
      title: t("totalProducts"),
      value: products?.length || 0,
      icon: Package,
      loading: isLoadingProducts,
    },
    {
      title: t("totalCategories"),
      value: categories?.length || 0,
      icon: Folders,
      loading: isLoadingCategories,
    },
    {
      title: t("recentInquiriesLabel"),
      value: inquiries?.length || 0,
      icon: Mail,
      loading: isLoadingInquiries,
    },
    {
      title: t("totalOrders"),
      value: totalOrders ?? 0,
      icon: ShoppingBag,
      loading: totalOrders === null,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("overviewTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("welcomeMsg")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t("recentInquiriesTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInquiries ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : inquiries && inquiries.length > 0 ? (
              <div className="space-y-4">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <div key={inquiry.id} className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{inquiry.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">{t("noInquiries")}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t("recentProductsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.nameEn} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.nameEn}</p>
                      <p className="text-xs text-muted-foreground">
                        {categories?.find(c => c.id === product.categoryId)?.nameEn || t("noCategory")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">{t("noProductsYet")}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
