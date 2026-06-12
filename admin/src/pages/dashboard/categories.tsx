import { useState, useMemo } from "react";
import { 
  useListCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Folders, Icon as LucideIconComponent } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/lib/api";

const categorySchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  nameEn: z.string().min(1, "Name (EN) is required"),
  nameFr: z.string().min(1, "Name (FR) is required"),
  nameAr: z.string().min(1, "Name (AR) is required"),
  descriptionEn: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  iconName: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// Helper to render lucide icon dynamically
const renderIcon = (iconName: string | null | undefined) => {
  if (!iconName) return <Folders className="h-5 w-5 text-gray-400" />;
  // @ts-ignore
  const Icon = LucideIcons[iconName];
  if (!Icon) return <Folders className="h-5 w-5 text-gray-400" />;
  return <Icon className="h-5 w-5 text-primary" />;
};

export default function DashboardCategories() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useListCategories();

  const createMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        setIsFormOpen(false);
        toast({ title: "Category created successfully" });
      },
      onError: (e) => toast({ title: "Failed to create", description: e.message, variant: "destructive" }),
    }
  });

  const updateMutation = useUpdateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        setIsFormOpen(false);
        toast({ title: "Category updated successfully" });
      },
      onError: (e) => toast({ title: "Failed to update", description: e.message, variant: "destructive" }),
    }
  });

  const deleteMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        setDeleteId(null);
        toast({ title: "Category deleted successfully" });
      },
      onError: (e) => toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
    }
  });

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.nameEn.toLowerCase().includes(search.toLowerCase()) || 
      c.slug.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      slug: "", nameEn: "", nameFr: "", nameAr: "",
      descriptionEn: "", descriptionFr: "", descriptionAr: "", iconName: ""
    }
  });

  const openNewForm = () => {
    setEditingCategory(null);
    form.reset({
      slug: "", nameEn: "", nameFr: "", nameAr: "",
      descriptionEn: "", descriptionFr: "", descriptionAr: "", iconName: ""
    });
    setIsFormOpen(true);
  };

  const openEditForm = (c: Category) => {
    setEditingCategory(c);
    form.reset({
      slug: c.slug, nameEn: c.nameEn, nameFr: c.nameFr || "", nameAr: c.nameAr || "",
      descriptionEn: c.descriptionEn || "", descriptionFr: c.descriptionFr || "", descriptionAr: c.descriptionAr || "",
      iconName: c.iconName || ""
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  // Simple stub for default icon since we can't easily import it without conflicts
  const Folders = LucideIcons.Folders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">Organize your furniture into collections</p>
        </div>
        <Button onClick={openNewForm} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search categories..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="bg-white"
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-16">Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No categories found.</TableCell></TableRow>
            ) : (
              filteredCategories.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="p-2 bg-primary/5 rounded border border-primary/10 inline-flex">
                      {renderIcon(c.iconName)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{c.nameEn}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{c.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="living-room" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="iconName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lucide Icon Name</FormLabel>
                    <FormControl><Input placeholder="Armchair, Bed, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Tabs defaultValue="en">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="fr">French</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4 pt-4">
                  <FormField control={form.control} name="nameEn" render={({ field }) => (
                    <FormItem><FormLabel>Name (EN)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionEn" render={({ field }) => (
                    <FormItem><FormLabel>Description (EN)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="fr" className="space-y-4 pt-4">
                  <FormField control={form.control} name="nameFr" render={({ field }) => (
                    <FormItem><FormLabel>Name (FR)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionFr" render={({ field }) => (
                    <FormItem><FormLabel>Description (FR)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </TabsContent>
                <TabsContent value="ar" className="space-y-4 pt-4">
                  <FormField control={form.control} name="nameAr" render={({ field }) => (
                    <FormItem><FormLabel>Name (AR)</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                    <FormItem><FormLabel>Description (AR)</FormLabel><FormControl><Textarea dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the category and may break products linked to it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
