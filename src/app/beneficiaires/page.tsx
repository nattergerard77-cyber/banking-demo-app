import DesktopBeneficiaries from "@/components/desktop/DesktopBeneficiaries";
import MobileBeneficiaries from "@/components/mobile/MobileBeneficiaries";
import ResponsivePage from "@/components/shared/ResponsivePage";

export default function BeneficiariesPage() {
  return (
    <ResponsivePage
      desktop={<DesktopBeneficiaries />}
      mobile={<MobileBeneficiaries />}
    />
  );
}
