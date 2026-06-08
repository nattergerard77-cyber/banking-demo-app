import DesktopSavings from "@/components/desktop/DesktopSavings";
import MobileSavings from "@/components/mobile/MobileSavings";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function SavingsPage() {
  return (
    <ResponsivePage
      desktop={<DesktopSavings />}
      mobile={<MobileSavings />}
    />
  );
}
