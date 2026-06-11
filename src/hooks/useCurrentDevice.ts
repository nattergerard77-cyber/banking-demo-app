"use client";

import { useEffect, useState } from "react";

export interface DeviceInfo {
  os: string;
  browser: string;
  type: "Desktop" | "Mobile" | "Tablet";
  language: string;
  resolution: string;
  connectedAt: Date;
}

function detectOS(ua: string): string {
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPad|iPod/.test(ua)) return "iOS";
  if (/iPhone/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(ua: string): string {
  if (/Edg/.test(ua)) return "Edge";
  if (/Chrome/.test(ua)) return "Chrome";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Safari/.test(ua)) return "Safari";
  return "Unknown";
}

function detectType(ua: string): "Desktop" | "Mobile" | "Tablet" {
  if (/iPad|Android(?!.*Mobile)/.test(ua)) return "Tablet";
  if (/Mobile|Android|iPhone|iPod/.test(ua)) return "Mobile";
  return "Desktop";
}

function detectDevice(): DeviceInfo | null {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  return {
    os: detectOS(ua),
    browser: detectBrowser(ua),
    type: detectType(ua),
    language: navigator.language,
    resolution: `${window.screen.width}x${window.screen.height}`,
    connectedAt: new Date(),
  };
}

export function useCurrentDevice(): DeviceInfo | null {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDevice(detectDevice());
  }, []);
  return device;
}
