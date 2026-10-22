import { ImageResponse } from "next/og";

// Icoon voor het beginscherm van iPhone/iPad ("Zet op beginscherm"). iOS rondt de hoeken zelf af.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#b39bbd" strokeWidth="3" />
          <path d="M14.5 22.5h19v2.5a7.5 7.5 0 0 1-7.5 7.5h-4a7.5 7.5 0 0 1-7.5-7.5z" fill="#b39bbd" />
          <path d="M19.5 18v-2.5M24 18v-4M28.5 18v-2.5" stroke="#b39bbd" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
