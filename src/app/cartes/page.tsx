import DesktopCards from "@/components/desktop/DesktopCards";
import MobileCards from "@/components/mobile/MobileCards";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function CardsPage() {
  return <ResponsivePage desktop={<DesktopCards />} mobile={<MobileCards />} />;
}
