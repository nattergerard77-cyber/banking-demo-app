import DesktopSettings from "@/components/desktop/DesktopSettings";
import MobileSettings from "@/components/mobile/MobileSettings";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function SettingsPage() {
  return (
    <ResponsivePage
      desktop={<DesktopSettings />}
      mobile={<MobileSettings />}
    />
  );
}
