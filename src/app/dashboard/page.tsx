import ResponsivePage from '@/components/shared/ResponsivePage';
import DesktopDashboard from '@/components/desktop/DesktopDashboard';
import MobileDashboard from '@/components/mobile/MobileDashboard';

export default function DashboardPage() {
  return <ResponsivePage desktop={<DesktopDashboard />} mobile={<MobileDashboard />} />;
}
