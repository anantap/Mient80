import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { EditProvider } from "@/components/EditProvider";
import { canEdit, codeRequired } from "@/lib/auth";
import { hasDatabase } from "@/lib/store";
import "./globals.css";

// Zelfde typografie als cpc2027: Archivo (breed, wdth 125) voor titels en getallen.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Mient 80", template: "%s · Mient 80" },
  description: "Projectoverzicht keukenverbouwing Mient 80",
  appleWebApp: { title: "Mient 80", capable: true, statusBarStyle: "black" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f0f0f",
};

const themeScript = `try{var t=localStorage.getItem("mient80-theme");if(t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const required = codeRequired();
  const locked = required && !(await canEdit());
  return (
    <html lang="nl" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <EditProvider required={required} initiallyLocked={locked}>
          <div className="shell">
            <Sidebar />
            <main className="content">
              {!hasDatabase() && (
                <p className="db-warning" role="alert">
                  Geen database gekoppeld: wijzigingen worden niet bewaard. Koppel Upstash via Storage in Vercel en
                  doe een redeploy.
                </p>
              )}
              {children}
            </main>
          </div>
        </EditProvider>
      </body>
    </html>
  );
}
