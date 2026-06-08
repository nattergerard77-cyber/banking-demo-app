import DesktopNotifications from "@/components/desktop/DesktopNotifications";
import MobileNotifications from "@/components/mobile/MobileNotifications";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function NotificationsPage() {
  return (
    <ResponsivePage
      desktop={<DesktopNotifications />}
      mobile={<MobileNotifications />}
    />
  );
}
