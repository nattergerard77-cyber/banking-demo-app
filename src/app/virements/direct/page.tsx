import DesktopDirectTransfer from "@/components/desktop/DesktopDirectTransfer";
import MobileDirectTransfer from "@/components/mobile/MobileDirectTransfer";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function DirectTransferPage() {
  return (
    <ResponsivePage
      desktop={<DesktopDirectTransfer />}
      mobile={<MobileDirectTransfer />}
    />
  );
}
