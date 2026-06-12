import { useState, useEffect } from "react";
import { ShoppingBag, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useAdminLanguage } from "@/hooks/use-admin-language";

const API_BASE = "";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

interface OrderItem {
  productId: number;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customerName: string;
  phone: string;
  email?: string | null;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function useOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOrders(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchOrders(); }, []);

  async function updateStatus(id: number, status: string) {
    await fetch(`${API_BASE}/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev
    );
  }

  return { orders, isLoading, error, updateStatus, refresh: fetchOrders };
}

function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: number, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { t, language } = useAdminLanguage();

  const statusKeys: Record<string, "pending" | "confirmed" | "delivered" | "cancelled"> = {
    pending: "pending", confirmed: "confirmed", delivered: "delivered", cancelled: "cancelled",
  };

  const date = new Date(order.createdAt).toLocaleString("fr-DZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  function getItemName(item: OrderItem) {
    if (language === "ar") return item.nameAr || item.nameEn;
    if (language === "fr") return item.nameFr || item.nameEn;
    return item.nameEn;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 bg-white">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <div className="text-xs text-gray-500">{t("customer")}</div>
            <div className="font-semibold text-gray-900">{order.customerName}</div>
            <div className="text-gray-500">{order.phone}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("date")}</div>
            <div className="text-gray-700">{date}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("total")}</div>
            <div className="font-bold text-secondary">
              {order.totalAmount > 0 ? `${order.totalAmount.toLocaleString()} DZD` : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">{t("status")}</div>
            <select
              value={order.status}
              onChange={(e) => { e.stopPropagation(); onStatusChange(order.id, e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}
            >
              {(["pending", "confirmed", "delivered", "cancelled"] as const).map((val) => (
                <option key={val} value={val}>{t(val)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {order.email && (
            <p className="text-sm text-gray-600 mb-3">{t("email")}: {order.email}</p>
          )}
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t("items")}</h4>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🛋</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{getItemName(item)}</p>
                  <p className="text-xs text-gray-500">
                    {t("qty")}: {item.quantity}
                    {item.price > 0 && ` · ${(item.price * item.quantity).toLocaleString()} DZD`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { orders, isLoading, error, updateStatus, refresh } = useOrders();
  const { t } = useAdminLanguage();

  const statusList = ["pending", "confirmed", "delivered", "cancelled"] as const;

  const counts = orders
    ? statusList.map((status) => ({
        status,
        label: t(status),
        count: orders.filter((o) => o.status === status).length,
      }))
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-secondary" />
            {t("ordersTitle")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders != null ? `${orders.length} ${t("totalOrders")}` : t("loading")}
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t("refresh")}
        </button>
      </div>

      {/* Status Summary */}
      {orders != null && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {counts.map(({ status, label, count }) => (
            <div key={status} className={`rounded-xl p-3 text-center ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Orders List */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {orders != null && orders.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{t("noOrders")}</p>
        </div>
      )}

      {orders != null && orders.length > 0 && (
        <div>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
