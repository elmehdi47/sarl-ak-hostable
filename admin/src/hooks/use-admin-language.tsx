import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "ar" | "fr" | "en";

const translations = {
  ar: {
    // Sidebar nav
    overview: "لوحة التحكم",
    products: "المنتجات",
    categories: "الفئات",
    inquiries: "الاستفسارات",
    orders: "الطلبات",
    logout: "تسجيل الخروج",
    loggedOut: "تم تسجيل الخروج بنجاح",
    logoutFailed: "فشل تسجيل الخروج",
    sarlAk: "SARL AK",
    // Overview
    overviewTitle: "لوحة التحكم",
    welcomeMsg: "مرحباً بك في لوحة إدارة SARL AK.",
    totalProducts: "إجمالي المنتجات",
    totalCategories: "إجمالي الفئات",
    recentInquiriesLabel: "الاستفسارات الواردة",
    totalOrders: "إجمالي الطلبات",
    recentInquiriesTitle: "آخر الاستفسارات",
    recentProductsTitle: "آخر المنتجات",
    noInquiries: "لا توجد استفسارات بعد.",
    noProductsYet: "لا توجد منتجات بعد.",
    noCategory: "بدون فئة",
    // Products
    productsTitle: "المنتجات",
    manageProducts: "إدارة منتجات الأثاث",
    addProduct: "إضافة منتج",
    editProductTitle: "تعديل المنتج",
    searchProducts: "البحث عن منتج...",
    noProducts: "لا توجد منتجات",
    imageCol: "الصورة",
    nameCol: "الاسم (EN)",
    nameFrCol: "الاسم (FR)",
    categoryCol: "الفئة",
    priceCol: "السعر",
    actionsCol: "الإجراءات",
    cancelBtn: "إلغاء",
    saveChanges: "حفظ التغييرات",
    createProduct: "إنشاء المنتج",
    deleteProduct: "حذف",
    confirmDeleteTitle: "هل أنت متأكد؟",
    confirmDeleteDesc: "لا يمكن التراجع عن هذا الإجراء. سيتم حذف المنتج نهائياً.",
    sortOrderLabel: "الترتيب",
    categoryLabel: "الفئة",
    priceLabel: "السعر (DZD)",
    imageLabel: "صورة المنتج",
    productImage: "صورة",
    uploadBtn: "رفع من الجهاز",
    // Orders
    ordersTitle: "الطلبات",
    totalOrdersStat: "إجمالي الطلبات",
    loading: "جارٍ التحميل...",
    refresh: "تحديث",
    customer: "العميل",
    date: "التاريخ",
    total: "الإجمالي",
    status: "الحالة",
    noOrders: "لا توجد طلبات بعد",
    items: "المنتجات",
    qty: "الكمية",
    email: "البريد الإلكتروني",
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    delivered: "تم التسليم",
    cancelled: "ملغى",
    // Site Images
    siteImages: "إعدادات الموقع",
    siteImagesTitle: "إعدادات الموقع",
    siteImagesDesc: "إدارة صور الموقع ومعلومات الاتصال",
    siteSettingsTitle: "إعدادات الموقع",
    siteSettingsDesc: "إدارة صور الموقع ومعلومات الاتصال",
    heroImages: "صور الشريحة الرئيسية",
    heroImage1: "الشريحة 1",
    heroImage2: "الشريحة 2",
    heroImage3: "الشريحة 3",
    aboutImage: "صورة من نحن",
    aboutSection: "قسم من نحن",
    contactInfo: "معلومات الاتصال",
    phoneNumber: "رقم الهاتف",
    emailAddress: "البريد الإلكتروني",
    address: "العنوان",
    whatsappNumber: "رقم واتساب",
    whatsappHint: "أدخل الرقم بدون مسافات أو رموز (مثال: 213661370370)",
    save: "حفظ",
    saved: "تم الحفظ",
    saveFailed: "فشل الحفظ",
  },
  fr: {
    // Sidebar nav
    overview: "Tableau de bord",
    products: "Produits",
    categories: "Catégories",
    inquiries: "Demandes",
    orders: "Commandes",
    logout: "Déconnexion",
    loggedOut: "Déconnecté avec succès",
    logoutFailed: "Échec de la déconnexion",
    sarlAk: "SARL AK",
    // Overview
    overviewTitle: "Tableau de bord",
    welcomeMsg: "Bienvenue dans le panneau d'administration SARL AK.",
    totalProducts: "Total produits",
    totalCategories: "Total catégories",
    recentInquiriesLabel: "Demandes reçues",
    totalOrders: "Total commandes",
    recentInquiriesTitle: "Dernières demandes",
    recentProductsTitle: "Derniers produits",
    noInquiries: "Aucune demande pour l'instant.",
    noProductsYet: "Aucun produit pour l'instant.",
    noCategory: "Sans catégorie",
    // Products
    productsTitle: "Produits",
    manageProducts: "Gérer les produits de mobilier",
    addProduct: "Ajouter un produit",
    editProductTitle: "Modifier le produit",
    searchProducts: "Rechercher un produit...",
    noProducts: "Aucun produit trouvé",
    imageCol: "Image",
    nameCol: "Nom (EN)",
    nameFrCol: "Nom (FR)",
    categoryCol: "Catégorie",
    priceCol: "Prix",
    actionsCol: "Actions",
    cancelBtn: "Annuler",
    saveChanges: "Enregistrer",
    createProduct: "Créer le produit",
    deleteProduct: "Supprimer",
    confirmDeleteTitle: "Êtes-vous sûr ?",
    confirmDeleteDesc: "Cette action est irréversible. Le produit sera définitivement supprimé.",
    sortOrderLabel: "Ordre d'affichage",
    categoryLabel: "Catégorie",
    priceLabel: "Prix (DZD)",
    imageLabel: "Image du produit",
    productImage: "Image",
    uploadBtn: "Téléverser depuis l'appareil",
    // Orders
    ordersTitle: "Commandes",
    totalOrdersStat: "commandes au total",
    loading: "Chargement...",
    refresh: "Actualiser",
    customer: "Client",
    date: "Date",
    total: "Total",
    status: "Statut",
    noOrders: "Aucune commande pour l'instant",
    items: "Articles",
    qty: "Qté",
    email: "E-mail",
    pending: "En attente",
    confirmed: "Confirmé",
    delivered: "Livré",
    cancelled: "Annulé",
    // Site Images
    siteImages: "Paramètres du site",
    siteImagesTitle: "Paramètres du site",
    siteImagesDesc: "Gérez les images du site et les informations de contact",
    siteSettingsTitle: "Paramètres du site",
    siteSettingsDesc: "Gérez les images du site et les informations de contact",
    heroImages: "Images du carousel principal",
    heroImage1: "Slide 1",
    heroImage2: "Slide 2",
    heroImage3: "Slide 3",
    aboutImage: "Image À propos",
    aboutSection: "Section À propos",
    contactInfo: "Informations de contact",
    phoneNumber: "Numéro de téléphone",
    emailAddress: "Adresse e-mail",
    address: "Adresse",
    whatsappNumber: "Numéro WhatsApp",
    whatsappHint: "Entrez le numéro sans espaces ni symboles (ex: 213661370370)",
    save: "Enregistrer",
    saved: "Enregistré",
    saveFailed: "Échec de l'enregistrement",
  },
  en: {
    // Sidebar nav
    overview: "Overview",
    products: "Products",
    categories: "Categories",
    inquiries: "Inquiries",
    orders: "Orders",
    logout: "Logout",
    loggedOut: "Logged out successfully",
    logoutFailed: "Logout failed",
    sarlAk: "SARL AK",
    // Overview
    overviewTitle: "Overview",
    welcomeMsg: "Welcome to the SARL AK administration panel.",
    totalProducts: "Total Products",
    totalCategories: "Total Categories",
    recentInquiriesLabel: "Recent Inquiries",
    totalOrders: "Total Orders",
    recentInquiriesTitle: "Recent Inquiries",
    recentProductsTitle: "Recent Products",
    noInquiries: "No inquiries yet.",
    noProductsYet: "No products yet.",
    noCategory: "No Category",
    // Products
    productsTitle: "Products",
    manageProducts: "Manage your furniture products",
    addProduct: "Add Product",
    editProductTitle: "Edit Product",
    searchProducts: "Search products...",
    noProducts: "No products found",
    imageCol: "Image",
    nameCol: "Name (EN)",
    nameFrCol: "Name (FR)",
    categoryCol: "Category",
    priceCol: "Price",
    actionsCol: "Actions",
    cancelBtn: "Cancel",
    saveChanges: "Save Changes",
    createProduct: "Create Product",
    deleteProduct: "Delete",
    confirmDeleteTitle: "Are you sure?",
    confirmDeleteDesc: "This action cannot be undone. This will permanently delete the product.",
    sortOrderLabel: "Sort Order",
    categoryLabel: "Category",
    priceLabel: "Price (DZD)",
    imageLabel: "Product Image",
    productImage: "Image",
    uploadBtn: "Upload from device",
    // Orders
    ordersTitle: "Orders",
    totalOrdersStat: "total orders",
    loading: "Loading...",
    refresh: "Refresh",
    customer: "Customer",
    date: "Date",
    total: "Total",
    status: "Status",
    noOrders: "No orders yet",
    items: "Items",
    qty: "Qty",
    email: "Email",
    pending: "Pending",
    confirmed: "Confirmed",
    delivered: "Delivered",
    cancelled: "Cancelled",
    // Site Images
    siteImages: "Site Settings",
    siteImagesTitle: "Site Settings",
    siteImagesDesc: "Manage site images and contact information",
    siteSettingsTitle: "Site Settings",
    siteSettingsDesc: "Manage site images and contact information",
    heroImages: "Hero Carousel Images",
    heroImage1: "Slide 1",
    heroImage2: "Slide 2",
    heroImage3: "Slide 3",
    aboutImage: "About Section Image",
    aboutSection: "About Section",
    contactInfo: "Contact Information",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    address: "Address",
    whatsappNumber: "WhatsApp Number",
    whatsappHint: "Enter the number without spaces or symbols (e.g. 213661370370)",
    save: "Save",
    saved: "Saved",
    saveFailed: "Failed to save",
  },
} as const;

type TKey = keyof (typeof translations)["en"];

interface LangCtx {
  language: Lang;
  setLanguage: (l: Lang) => void;
  t: (key: TKey) => string;
  isRTL: boolean;
}

const LangContext = createContext<LangCtx | null>(null);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem("admin-lang-v2") as Lang) || "ar"; } catch { return "ar"; }
  });

  const isRTL = language === "ar";

  function setLanguage(l: Lang) {
    setLang(l);
  }

  useEffect(() => {
    try { localStorage.setItem("admin-lang-v2", language); } catch {}
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [language, isRTL]);

  function t(key: TKey): string {
    return (translations[language] as Record<string, string>)[key] ?? (translations["en"] as Record<string, string>)[key] ?? key;
  }

  return (
    <LangContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

export function useAdminLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useAdminLanguage must be used within AdminLanguageProvider");
  return ctx;
}
