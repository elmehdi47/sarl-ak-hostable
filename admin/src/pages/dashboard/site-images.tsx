import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@/lib/use-upload";
import { useAdminLanguage } from "@/hooks/use-admin-language";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, Save } from "lucide-react";

type SettingsKey = "hero_1" | "hero_2" | "hero_3" | "about_image" | "contact_phone" | "contact_email" | "contact_address" | "contact_whatsapp";

function ImageSlot({
  label,
  settingKey,
  currentUrl,
  onUploaded,
}: {
  label: string;
  settingKey: SettingsKey;
  currentUrl: string;
  onUploaded: (key: SettingsKey, url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      const url = `/api/storage${response.objectPath}`;
      try {
        const res = await fetch(`/api/site-settings/${settingKey}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: url }),
        });
        if (!res.ok) throw new Error("Server error");
        onUploaded(settingKey, url);
        toast({ title: "Image updated successfully" });
      } catch {
        toast({ title: "Failed to save image URL", variant: "destructive" });
      }
    },
    onError: (err) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="aspect-video w-full bg-gray-100 relative">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon size={40} />
            <span className="text-sm text-gray-400">No image set — using default</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-gray-800 mb-3">{label}</p>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload size={14} />
          {isUploading ? `Uploading… ${progress}%` : "Upload new image"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {currentUrl && (
          <p className="mt-2 text-xs text-muted-foreground break-all line-clamp-1">{currentUrl}</p>
        )}
      </div>
    </div>
  );
}

function ContactFieldWrapper({
  label,
  settingKey,
  value,
  dir,
  onSaved,
  t,
}: {
  label: string;
  settingKey: SettingsKey;
  value: string;
  dir?: string;
  onSaved: () => void;
  t: (k: string) => string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const changed = localValue !== value;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/site-settings/${settingKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: localValue }),
      });
      if (!res.ok) throw new Error("Server error");
      toast({ title: t("saved") });
      onSaved();
    } catch {
      toast({ title: t("saveFailed"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          dir={dir}
          className="flex-1"
        />
        <Button
          size="sm"
          disabled={!changed || saving}
          onClick={handleSave}
          className="flex items-center gap-1.5"
        >
          <Save size={14} />
          {saving ? "..." : t("save")}
        </Button>
      </div>
    </div>
  );
}

export default function SiteImagesPage() {
  const { t } = useAdminLanguage();
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const handleUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  };

  const handleContactSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  };

  const imageSlots: { label: string; key: SettingsKey }[] = [
    { label: t("heroImage1"), key: "hero_1" },
    { label: t("heroImage2"), key: "hero_2" },
    { label: t("heroImage3"), key: "hero_3" },
    { label: t("aboutImage"), key: "about_image" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("siteSettingsTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("siteSettingsDesc")}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{t("heroImages")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {imageSlots.slice(0, 3).map(({ label, key }) => (
                <ImageSlot
                  key={key}
                  label={label}
                  settingKey={key}
                  currentUrl={settings[key] ?? ""}
                  onUploaded={handleUploaded}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{t("aboutSection")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <ImageSlot
                label={imageSlots[3].label}
                settingKey="about_image"
                currentUrl={settings["about_image"] ?? ""}
                onUploaded={handleUploaded}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{t("contactInfo")}</h2>
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5 max-w-2xl">
              <ContactFieldWrapper
                label={t("phoneNumber")}
                settingKey="contact_phone"
                value={settings["contact_phone"] ?? ""}
                dir="ltr"
                onSaved={handleContactSaved}
                t={t}
              />
              <ContactFieldWrapper
                label={t("emailAddress")}
                settingKey="contact_email"
                value={settings["contact_email"] ?? ""}
                dir="ltr"
                onSaved={handleContactSaved}
                t={t}
              />
              <ContactFieldWrapper
                label={t("address")}
                settingKey="contact_address"
                value={settings["contact_address"] ?? ""}
                onSaved={handleContactSaved}
                t={t}
              />
              <ContactFieldWrapper
                label={t("whatsappNumber")}
                settingKey="contact_whatsapp"
                value={settings["contact_whatsapp"] ?? ""}
                dir="ltr"
                onSaved={handleContactSaved}
                t={t}
              />
              <p className="text-xs text-muted-foreground">{t("whatsappHint")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
