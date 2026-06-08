import DesktopOperationsHistory from "@/components/desktop/DesktopOperationsHistory";
import MobileOperationsHistory from "@/components/mobile/MobileOperationsHistory";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function OperationsHistoryPage() {
  return (
    <ResponsivePage
      desktop={<DesktopOperationsHistory />}
      mobile={<MobileOperationsHistory />}
    />
  );
}
