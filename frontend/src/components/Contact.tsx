import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useSubmitContact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useContactInfo } from "@/hooks/use-contact-info";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  message: z.string().min(10, "Message is too short"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function LocationCard({
  label,
  mapUrl,
  embedQuery,
  linkUrl,
  openLabel,
}: {
  label: string;
  mapUrl: string;
  embedQuery: string;
  linkUrl: string;
  openLabel: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
        <MapPin size={14} className="text-secondary shrink-0" />
        {label}
      </p>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-44 rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity relative group"
      >
        <iframe
          src={`https://maps.google.com/maps?q=${embedQuery}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={label}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 bg-secondary text-white px-4 py-2 rounded-full text-xs font-medium transition-opacity">
            {openLabel}
          </span>
        </div>
      </a>
    </div>
  );
}

export function Contact() {
  const { t } = useLanguage();
  const submitMutation = useSubmitContact();
  const contactInfo = useContactInfo();
  const phoneRaw = contactInfo.contact_phone.replace(/\s+/g, "");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    submitMutation.mutate({ data }, {
      onSuccess: () => {
        toast.success(t("messageSent"));
        form.reset();
      },
      onError: () => {
        toast.error(t("messageError"));
      }
    });
  };

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{t("getInTouch")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-border">
              <h3 className="text-2xl font-serif font-bold text-primary mb-6">SARL AK</h3>
              
              <div className="space-y-6 text-muted-foreground">
                <div className="flex items-start gap-4">
                  <MapPin className="text-secondary shrink-0 mt-1" />
                  <p>{contactInfo.contact_address}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="text-secondary shrink-0" />
                  <a href={`tel:${phoneRaw}`} dir="ltr" className="hover:text-secondary transition-colors">{contactInfo.contact_phone}</a>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-secondary shrink-0" />
                  <a href={`mailto:${contactInfo.contact_email}`} className="hover:text-secondary transition-colors break-all">{contactInfo.contact_email}</a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{t("ourLocations")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocationCard
                  label={t("locationBBA")}
                  mapUrl="https://maps.google.com/maps?q=Bordj+Bou+Arreridj,Algeria&output=embed"
                  embedQuery="Bordj+Bou+Arreridj,Algeria"
                  linkUrl="https://maps.app.goo.gl/GQWzGJgphjfkQK297"
                  openLabel={t("openInMaps")}
                />
                <LocationCard
                  label={t("locationAlgiers")}
                  mapUrl="https://maps.google.com/maps?q=36.7538,3.0588&output=embed"
                  embedQuery="36.7538,3.0588"
                  linkUrl="https://maps.app.goo.gl/TH34yHbDv4PWMasc7"
                  openLabel={t("openInMaps")}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">{t("name")}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-muted/50 border-muted focus-visible:ring-secondary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">{t("phone")}</FormLabel>
                        <FormControl>
                          <Input placeholder="+213 555..." dir="ltr" className="bg-muted/50 border-muted focus-visible:ring-secondary text-left" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">{t("email")}</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" dir="ltr" className="bg-muted/50 border-muted focus-visible:ring-secondary text-left" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">{t("message")}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="..." 
                          className="min-h-[150px] bg-muted/50 border-muted focus-visible:ring-secondary resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={submitMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 text-lg"
                >
                  {submitMutation.isPending ? t("sending") : t("sendMessage")}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
