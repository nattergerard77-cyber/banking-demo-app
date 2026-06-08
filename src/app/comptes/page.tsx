import DesktopAccounts from "@/components/desktop/DesktopAccounts";
import MobileAccounts from "@/components/mobile/MobileAccounts";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function ComptesPage() {
  return (
    <ResponsivePage
      desktop={<DesktopAccounts />}
      mobile={<MobileAccounts />}
    />
  );
}
