import { Info } from 'lucide-react';

export default function DemoNotice() {
  return (
    <div className="flex items-center justify-center gap-2 bg-green-light py-2 text-sm font-medium text-navy">
      <Info size={16} />
      <span>Espace bancaire sécurisé.</span>
    </div>
  );
}
