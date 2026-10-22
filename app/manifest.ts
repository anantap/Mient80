import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mient 80",
    short_name: "Mient 80",
    description: "Projectoverzicht keukenverbouwing Mient 80",
    start_url: "/status",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#0f0f0f",
    lang: "nl",
    icons: [
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
