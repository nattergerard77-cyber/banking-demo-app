import ResponsivePage from '@/components/shared/ResponsivePage';
import DesktopLogin from '@/components/desktop/DesktopLogin';
import MobileLogin from '@/components/mobile/MobileLogin';

export default function LoginPage() {
  return (
    <ResponsivePage 
      desktop={<DesktopLogin />}
      mobile={<MobileLogin />}
    />
  );
}

