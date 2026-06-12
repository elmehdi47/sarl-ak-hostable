import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/hooks/use-language";

const API_BASE = "";

type Step = "cart" | "info";

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, totalAmount } = useCart();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Reset to cart step whenever sidebar reopens or cart becomes empty
  useEffect(() => {
    if (!isOpen) {
      setStep("cart");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (items.length === 0 && !success) setStep("cart");
  }, [items.length, success]);

  function getName(item: { nameEn: string; nameFr: string; nameAr: string }) {
    if (language === "ar") return item.nameAr;
    if (language === "fr") return item.nameFr;
    return item.nameEn;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        nameEn: i.nameEn,
        nameFr: i.nameFr,
        nameAr: i.nameAr,
        imageUrl: i.imageUrl,
        quantity: i.quantity,
        price: i.price,
      }));
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          email: form.email || undefined,
          items: orderItems,
          totalAmount,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
      clearCart();
      setForm({ name: "", phone: "", email: "" });
    } catch {
      setError(t("orderError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={closeCart}
      />
      <div
        className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {step === "info" && !success && items.length > 0 ? (
              <button
                onClick={() => setStep("cart")}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label={t("backToCart")}
              >
                <BackIcon className="h-5 w-5 text-gray-600" />
              </button>
            ) : (
              <ShoppingBag className="h-5 w-5 text-secondary" />
            )}
            <h2 className="text-lg font-bold text-primary">
              {step === "info" && !success ? t("customerInfo") : t("cart")}
            </h2>
            {step === "cart" && items.length > 0 && (
              <span className="bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("orderSuccess")}</h3>
            <button
              onClick={() => { setSuccess(false); closeCart(); }}
              className="mt-4 px-6 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {t("close")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!success && items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">{t("cartEmpty")}</h3>
            <p className="text-sm text-gray-400">{t("cartEmptyDesc")}</p>
          </div>
        )}

        {/* STEP 1: Cart Items */}
        {!success && items.length > 0 && step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={getName(item)} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🛋</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{getName(item)}</p>
                    {item.price > 0 && (
                      <p className="text-secondary text-sm font-bold mt-0.5">
                        {(item.price * item.quantity).toLocaleString()} {t("dzd")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ms-auto text-red-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with subtotal + confirm button */}
            <div className="border-t bg-white p-4 space-y-3">
              {totalAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t("subtotal")}</span>
                  <span className="text-lg font-bold text-secondary">
                    {totalAmount.toLocaleString()} {t("dzd")}
                  </span>
                </div>
              )}
              <button
                onClick={() => setStep("info")}
                className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {t("confirmOrder")}
                <BackIcon className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Customer Info Form */}
        {!success && items.length > 0 && step === "info" && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Order summary recap */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {t("orderSummary")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"}
                  </span>
                </div>
                {totalAmount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                    <span className="text-sm font-medium text-gray-700">{t("total")}</span>
                    <span className="text-lg font-bold text-secondary">
                      {totalAmount.toLocaleString()} {t("dzd")}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("orderName")} *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("orderPhone")} *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t("orderEmail")}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                />
              </div>
            </div>

            <div className="border-t bg-white p-4">
              <button
                type="submit"
                disabled={submitting || !form.name || !form.phone}
                className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t("placingOrder") : t("placeOrder")}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
