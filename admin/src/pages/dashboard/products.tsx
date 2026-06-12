import { useState, useMemo, useRef } from "react";
import {
  useListProducts,
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/lib/api";
import { useUpload } from "@/lib/use-upload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Upload, X } from "lucide-react";
import { useAdminLanguage } from "@/hooks/use-admin-language";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/api";

const productSchema = z.object({
  nameEn: z.string().min(1, "Name (EN) is required"),
  nameFr: z.string().min(1, "Name (FR) is required"),
  nameAr: z.string().min(1, "Name (AR) is required"),
  descriptionEn: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  price: z.number().min(0).default(0),
  categoryId: z.number().min(1, "Category is required"),
  sortOrder: z.number().default(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

function ImageUploadField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (url: string) => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      const servingUrl = `/api/storage${response.objectPath}`;
      onChange(servingUrl);
      toast({ title: "Image uploaded successfully" });
    },
    onError: (err) => {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="https://... or upload an image below"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            title="Clear image"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          {isUploading ? `Uploading… ${progress}%` : "Upload from device"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <span className="text-xs text-muted-foreground">JPG, PNG, WebP supported</span>
      </div>

      {value && (
        <div className="relative w-32 h-24 rounded-lg border overflow-hidden bg-gray-50">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardProducts() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading: isLoadingProducts } = useListProducts();
  const { data: categories = [] } = useListCategories();

  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setIsFormOpen(false);
        toast({ title: "Product created successfully" });
      },
      onError: (e) =>
        toast({ title: "Failed to create product", description: e.message, variant: "destructive" }),
    },
  });

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setIsFormOpen(false);
        toast({ title: "Product updated successfully" });
      },
      onError: (e) =>
        toast({ title: "Failed to update product", description: e.message, variant: "destructive" }),
    },
  });

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setDeleteId(null);
        toast({ title: "Product deleted successfully" });
      },
      onError: (e) =>
        toast({ title: "Failed to delete product", description: e.message, variant: "destructive" }),
    },
  });

  const filteredProducts = useMemo(() => {
    return (products as Product[]).filter(
      (p) =>
        p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        p.nameFr?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const { t } = useAdminLanguage();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameEn: "",
      nameFr: "",
      nameAr: "",
      descriptionEn: "",
      descriptionFr: "",
      descriptionAr: "",
      imageUrl: "",
      price: 0,
      categoryId: 0,
      sortOrder: 0,
    },
  });

  const openCreate = () => {
    setEditingProduct(null);
    form.reset({
      nameEn: "", nameFr: "", nameAr: "",
      descriptionEn: "", descriptionFr: "", descriptionAr: "",
      imageUrl: "", price: 0, categoryId: 0, sortOrder: 0,
    });
    setIsFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      nameEn: product.nameEn,
      nameFr: product.nameFr ?? "",
      nameAr: product.nameAr ?? "",
      descriptionEn: product.descriptionEn ?? "",
      descriptionFr: product.descriptionFr ?? "",
      descriptionAr: product.descriptionAr ?? "",
      imageUrl: product.imageUrl ?? "",
      price: (product as any).price ?? 0,
      categoryId: product.categoryId,
      sortOrder: product.sortOrder ?? 0,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: ProductFormValues) => {
    const payload = { ...data, imageUrl: data.imageUrl || undefined };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("productsTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("manageProducts")}</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus size={16} /> {t("addProduct")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder={t("searchProducts")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoadingProducts ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("imageCol")}</TableHead>
                <TableHead>{t("nameCol")}</TableHead>
                <TableHead>{t("nameFrCol")}</TableHead>
                <TableHead>{t("categoryCol")}</TableHead>
                <TableHead>{t("priceCol")}</TableHead>
                <TableHead className="text-right">{t("actionsCol")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t("noProducts")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const cat = (categories as any[]).find((c: any) => c.id === product.categoryId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.nameEn}
                            className="w-12 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon size={16} className="text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.nameEn}</TableCell>
                      <TableCell className="text-muted-foreground">{product.nameFr}</TableCell>
                      <TableCell>{cat?.nameEn ?? product.categoryId}</TableCell>
                      <TableCell className="text-sm font-medium text-orange-600">
                        {(product as any).price > 0 ? `${((product as any).price).toLocaleString()} DZD` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setIsFormOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? t("editProductTitle") : t("addProduct")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="en">
                <TabsList className="mb-4">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4">
                  <FormField control={form.control} name="nameEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (English)</FormLabel>
                      <FormControl><Input placeholder="e.g. Executive Desk" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionEn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl><Textarea placeholder="Product description..." rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>

                <TabsContent value="fr" className="space-y-4">
                  <FormField control={form.control} name="nameFr" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom (Français)</FormLabel>
                      <FormControl><Input placeholder="ex. Bureau exécutif" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionFr" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Français)</FormLabel>
                      <FormControl><Textarea placeholder="Description du produit..." rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>

                <TabsContent value="ar" className="space-y-4">
                  <FormField control={form.control} name="nameAr" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم (العربية)</FormLabel>
                      <FormControl><Input dir="rtl" placeholder="مثال: مكتب تنفيذي" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف (العربية)</FormLabel>
                      <FormControl><Textarea dir="rtl" placeholder="وصف المنتج..." rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(parseInt(v, 10))}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(categories as any[]).map((cat: any) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.nameEn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (DZD)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <ImageUploadField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>{t("cancelBtn")}</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProduct ? t("saveChanges") : t("createProduct")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteProduct")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
