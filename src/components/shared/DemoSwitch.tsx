"use client";

type DemoSwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export default function DemoSwitch({ checked, onChange, label }: DemoSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center overflow-hidden rounded-full p-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ACD00]/40 ${
        checked ? "bg-[#9ACD00]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
