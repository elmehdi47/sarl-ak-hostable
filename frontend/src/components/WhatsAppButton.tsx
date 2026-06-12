import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useContactInfo } from "@/hooks/use-contact-info";

export function WhatsAppButton() {
  const { contact_whatsapp } = useContactInfo();

  return (
    <motion.a
      href={`https://wa.me/${contact_whatsapp}?text=Hello%2C%20I'm%20interested%20in%20your%20services`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 end-6 md:bottom-8 md:end-8 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      aria-label="Contact us on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
      <MessageCircle size={28} className="relative z-10" />
    </motion.a>
  );
}
