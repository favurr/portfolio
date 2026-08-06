import type { Metadata } from "next";

interface GenerateMetadataProps {
  title: string;
  description: string;
  slug?: string;
  ogImage?: string;
}

export function constructMetadata({
  title,
  description,
  slug = "",
  ogImage = "/og-image.png",
}: GenerateMetadataProps): Metadata {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const url = `${baseUrl}${slug ? `/projects/${slug}` : ""}`;

  return {
    title: `${title} — FAVURR`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "FAVURR Portfolio",
      images: [
        {
          url: ogImage,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
