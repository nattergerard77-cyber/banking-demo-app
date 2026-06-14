import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  userAgent: string;
  deviceName: string;
  deviceType: "mobile" | "tablet" | "desktop";
  browserName: string;
  osName: string;
}

export function detectDevice(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const rawDeviceType = result.device.type || "desktop";
  const browserName = result.browser.name || "Unknown";
  const osName = result.os.name || "Unknown";
  const deviceName = `${osName} ${browserName}`;

  return {
    userAgent,
    deviceName,
    deviceType: (rawDeviceType === "mobile" || rawDeviceType === "tablet"
      ? rawDeviceType
      : "desktop") as "mobile" | "tablet" | "desktop",
    browserName,
    osName,
  };
}

export function getDeviceIcon(deviceType: "mobile" | "tablet" | "desktop"): string {
  switch (deviceType) {
    case "mobile":
      return "📱";
    case "tablet":
      return "📱";
    default:
      return "🖥️";
  }
}
