import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  slug: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionAr?: string | null;
  iconName?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: number;
  categoryId?: number | null;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionAr?: string | null;
  imageUrl?: string | null;
  featured: boolean;
  sortOrder: number;
  price: number;
  createdAt: string;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt: string;
}

export interface Order {
  id: number;
  customerName: string;
  phone: string;
  email?: string | null;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error || `HTTP ${res.status}`), { response: { data: err } });
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useListCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: () => apiFetch("/api/categories"),
  });
}

export function useCreateCategory(opts?: { mutation?: any }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch<Category>("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/categories"] }),
    ...opts?.mutation,
  });
}

export function useUpdateCategory(opts?: { mutation?: any }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiFetch<Category>(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/categories"] }),
    ...opts?.mutation,
  });
}

export function useDeleteCategory(opts?: { mutation?: any }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<null>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/categories"] }),
    ...opts?.mutation,
  });
}

// ── Products ──────────────────────────────────────────────────────────────────

export function useListProducts(params?: { categoryId?: number; featured?: boolean; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.categoryId != null) search.set("categoryId", String(params.categoryId));
  if (params?.featured != null) search.set("featured", String(params.featured));
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));

  const qs = search.toString();
  return useQuery<Product[]>({
    queryKey: ["/api/products", qs],
    queryFn: () => apiFetch<Product[] | any>(`/api/products${qs ? `?${qs}` : ""}`).then(d => Array.isArray(d) ? d : d.products ?? []),
  });
}

export function useCreateProduct(opts?: { mutation?: any }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch<Product>("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...opts?.mutation,
  });
}

export function useUpdateProduct(opts?: { mutation?: any }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiFetch<Product>(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...opts?.mutation,
  });
}

export function useDeleteProduct(opts?: { mutation?: any }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<null>(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...opts?.mutation,
  });
}

// ── Inquiries ─────────────────────────────────────────────────────────────────

export function useListInquiries() {
  return useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
    queryFn: () => apiFetch("/api/inquiries"),
  });
}

export function useSubmitContact(opts?: { mutation?: any }) {
  return useMutation({
    mutationFn: ({ data }: { data: { name: string; email: string; phone?: string; message: string } }) =>
      apiFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function useGetMe(opts?: { query?: any }) {
  return useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => apiFetch("/api/auth/me"),
    retry: false,
    ...opts?.query,
  });
}

export function useAdminLogin(opts?: { mutation?: any }) {
  return useMutation({
    mutationFn: ({ data }: { data: { username: string; password: string } }) =>
      apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    ...opts?.mutation,
  });
}

export function useAdminLogout(opts?: { mutation?: any }) {
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
    ...opts?.mutation,
  });
}
