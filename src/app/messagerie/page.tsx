import DesktopMessages from "@/components/desktop/DesktopMessages";
import MobileMessages from "@/components/mobile/MobileMessages";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function MessagesPage() {
  return (
    <ResponsivePage
      desktop={<DesktopMessages />}
      mobile={<MobileMessages />}
    />
  );
}
