"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getDeviceIcon } from "@/lib/device-detection";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type DeviceSession = {
  id: string;
  device_name: string;
  device_type: "mobile" | "tablet" | "desktop";
  ip_address: string;
  city?: string | null;
  country?: string | null;
  last_activity: string;
  created_at: string;
};

const supabase = createBrowserSupabaseClient();

export function TrustedDevices({ accountId }: { accountId: string }) {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => `/api/device-sessions?accountId=${accountId}`, [accountId]);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = (await response.json()) as { devices?: DeviceSession[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Error fetching devices");
      }

      setDevices(data.devices || []);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error fetching devices");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const registerCurrentDevice = useCallback(async () => {
    try {
      await fetch("/api/device-sessions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
    } catch (registerError) {
      console.error("Error registering device:", registerError);
    }
  }, [accountId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDevices();
      void registerCurrentDevice();
    }, 0);

    const channel = supabase
      .channel(`device_sessions_${accountId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "device_sessions",
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          void fetchDevices();
        },
      )
      .subscribe();

    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [accountId, fetchDevices, registerCurrentDevice]);

  const handleDisconnectDevice = async (deviceId: string, deviceName: string) => {
    if (!window.confirm(`Déconnecter ${deviceName} ?`)) return;

    try {
      const response = await fetch(`/api/device-sessions/${deviceId}?accountId=${accountId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la déconnexion");
      }

      setDevices((current) => current.filter((device) => device.id !== deviceId));
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Erreur lors de la déconnexion");
    }
  };

  if (loading) {
    return <div className="p-4 text-[14px] text-[#6B7280]">Chargement des appareils...</div>;
  }

  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_30px_rgba(5,0,51,0.08)]">
      <h2 className="text-[18px] font-bold text-[#090927]">Appareils de confiance</h2>
      <p className="mt-1 text-[13px] text-[#6B7280]">
        Appareils actuellement connectés à votre compte sur la dernière heure.
      </p>

      {error ? (
        <div className="mt-4 rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      {devices.length === 0 ? (
        <p className="mt-4 text-[14px] text-[#6B7280]">Aucun appareil actif</p>
      ) : (
        <div className="mt-4 space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-start justify-between gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#FCFCFD] p-4"
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <span className="text-2xl">{getDeviceIcon(device.device_type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[#090927]">{device.device_name}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">IP: {device.ip_address}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    {device.city ? `${device.city}, ${device.country}` : "Localisation inconnue"}
                  </p>
                  <p className="mt-2 text-[11px] text-[#9CA3AF]">
                    Dernière activité : {new Date(device.last_activity).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDisconnectDevice(device.id, device.device_name)}
                className="rounded-[10px] bg-[#DC2626] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#B91C1C]"
              >
                Déconnecter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
