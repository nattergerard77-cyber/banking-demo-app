export const theme = {
  colors: {
    navy: "#050033",
    navySecondary: "#090927",
    green: "#9ACD00",
    greenLight: "#EEF7D8",
    background: "#F6F7F9",
    card: "#FFFFFF",
    border: "#E5E7EB",
    textPrimary: "#090927",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    success: "#7AA600",
    error: "#DC2626",
    warning: "#F59E0B",
  },
  radii: {
    card: "1.25rem",
    button: "0.875rem",
  },
  shadows: {
    card: "0 18px 45px rgba(5, 0, 51, 0.08)",
  },
  layout: {
    desktopSidebarWidth: "280px",
    desktopTopbarHeight: "76px",
    mobileHeaderHeight: "64px",
    mobileBottomNavHeight: "72px",
  },
} as const;
