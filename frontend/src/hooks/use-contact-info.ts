import { useEffect, useState } from "react";

const DEFAULTS = {
  contact_phone: "+213 661 370 370",
  contact_email: "elmehdi.moussaoui123@gmail.com",
  contact_address: "Wilaya de Bordj Bou Arréridj (BBA), Algérie",
  contact_whatsapp: "213661370370",
};

let cached: typeof DEFAULTS | null = null;
let fetchPromise: Promise<typeof DEFAULTS> | null = null;

function fetchContactInfo(): Promise<typeof DEFAULTS> {
  if (cached) return Promise.resolve(cached);
  if (!fetchPromise) {
    fetchPromise = fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        cached = {
          contact_phone: data.contact_phone || DEFAULTS.contact_phone,
          contact_email: data.contact_email || DEFAULTS.contact_email,
          contact_address: data.contact_address || DEFAULTS.contact_address,
          contact_whatsapp: data.contact_whatsapp || DEFAULTS.contact_whatsapp,
        };
        return cached;
      })
      .catch(() => {
        cached = DEFAULTS;
        return DEFAULTS;
      });
  }
  return fetchPromise;
}

export function useContactInfo() {
  const [info, setInfo] = useState(cached || DEFAULTS);

  useEffect(() => {
    fetchContactInfo().then(setInfo);
  }, []);

  return info;
}
