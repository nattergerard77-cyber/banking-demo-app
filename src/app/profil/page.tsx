import DesktopProfile from "@/components/desktop/DesktopProfile";
import MobileProfile from "@/components/mobile/MobileProfile";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function ProfilPage() {
  return (
    <ResponsivePage
      desktop={<DesktopProfile />}
      mobile={<MobileProfile />}
    />
  );
}
