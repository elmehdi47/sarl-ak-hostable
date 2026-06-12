import {
  Briefcase,
  UtensilsCrossed,
  BedDouble,
  Bed,
  Sofa,
  Armchair,
  Lamp,
  BookOpen,
  Package,
  Store,
  Home,
  Building2,
  DoorOpen,
  Tv,
  Bath,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  UtensilsCrossed,
  BedDouble,
  Bed,
  Sofa,
  Armchair,
  Lamp,
  BookOpen,
  Package,
  Store,
  Home,
  Building2,
  DoorOpen,
  Tv,
  Bath,
  Warehouse,
};

export function getLucideIcon(name?: string | null): LucideIcon {
  if (!name) return Package;
  return ICON_MAP[name] ?? Package;
}
