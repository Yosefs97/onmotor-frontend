// components/TrustBar.jsx
import { Check, ShieldCheck, Truck } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="grid gap-px overflow-hidden rounded-none border-y border-zinc-200 bg-zinc-200 sm:grid-cols-3 sm:rounded-2xl sm:border-x">
      <div className="flex items-center gap-3 bg-white px-5 py-4">
        <Truck className="h-6 w-6 shrink-0 text-[#e60000]" />
        <p className="text-sm font-bold text-zinc-800">
          משלוח חינם מעל ₪499 <span className="font-normal text-zinc-500">למעט חלקי חילוף</span>
        </p>
      </div>
      <div className="flex items-center gap-3 bg-white px-5 py-4">
        <ShieldCheck className="h-6 w-6 shrink-0 text-[#e60000]" />
        <p className="text-sm font-bold text-zinc-800">
          תשלום מאובטח וקנייה בראש שקט
        </p>
      </div>
      <div className="flex items-center gap-3 bg-white px-5 py-4">
        <Check className="h-6 w-6 shrink-0 text-[#e60000]" />
        <p className="text-sm font-bold text-zinc-800">
          חלפים חדשים ומשומשים שנבדקו
        </p>
      </div>
    </section>
  );
}