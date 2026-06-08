export interface ResponsivePageProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
}

export default function ResponsivePage({ desktop, mobile }: ResponsivePageProps) {
  return (
    <>
      <div className="hidden lg:block">{desktop}</div>
      <div className="block lg:hidden">{mobile}</div>
    </>
  );
}
