import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { EditProvider } from "@/components/EditProvider";
import { canEdit, codeRequired } from "@/lib/auth";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "Mient 80", template: "%s · Mient 80" },
  description: "Projectoverzicht keukenverbouwing Mient 80",
  appleWebApp: { title: "Mient 80", capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#161514" },
  ],
};

const themeScript = `try{var t=localStorage.getItem("mient80-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const required = codeRequired();
  const locked = required && !(await canEdit());
  return (
    <html lang="nl" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <EditProvider required={required} initiallyLocked={locked}>
          <div className="shell">
            <Sidebar />
            <main className="content">{children}</main>
          </div>
        </EditProvider>
      </body>
    </html>
  );
}
