import { useRoute } from "wouter";
import { ServicePage } from "@/components/ServicePage";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";

  return <ServicePage categorySlug={slug} />;
}
