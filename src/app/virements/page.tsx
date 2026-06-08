import DesktopTransfers from "@/components/desktop/DesktopTransfers";
import MobileTransfers from "@/components/mobile/MobileTransfers";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function TransfersPage() {
  return (
    <ResponsivePage
      desktop={<DesktopTransfers />}
      mobile={<MobileTransfers />}
    />
  );
}
