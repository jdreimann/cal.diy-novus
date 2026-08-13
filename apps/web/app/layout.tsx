import { getLocale } from "@calcom/features/auth/lib/getLocale";
import { loadTranslations } from "@calcom/i18n/server";
import { IconSprites } from "@calcom/ui/components/icon";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { dir } from "i18next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import type React from "react";

import "../styles/globals.css";
import { AppRouterI18nProvider } from "./AppRouterI18nProvider";
import { Providers } from "./providers";
import { SpeculationRules } from "./SpeculationRules";
import process from "node:process";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
  display: "swap",
});
const calFont = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "block",
  weight: "600",
});

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f9fafb",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#1C1C1C",
    },
  ],
};

export const metadata = {
  icons: {
    icon: "/api/logo?type=favicon-32",
    apple: "/api/logo?type=apple-touch-icon",
    other: [
      {
        rel: "icon-mask",
        url: "/safari-pinned-tab.svg",
        color: "#000000",
      },
      {
        url: "/api/logo?type=favicon-16",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/api/logo?type=favicon-32",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "application-TileColor": "#ff0000",
  },
  twitter: {
    site: "@calcom",
    creator: "@calcom",
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const getInitialProps = async () => {
  const h = await headers();
  const isEmbed = h.get("x-isEmbed") === "true";
  const embedColorScheme = h.get("x-embedColorScheme");
  const newLocale =
    (await getLocale(buildLegacyRequest(await headers(), await cookies()))) ??
    "en";
  const direction = dir(newLocale) ?? "ltr";

  return {
    isEmbed,
    embedColorScheme,
    locale: newLocale,
    direction,
  };
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const nonce = h.get("x-csp-nonce") ?? "";

  const country =
    h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || "Unknown";

  const { locale, direction, isEmbed, embedColorScheme } =
    await getInitialProps();

  const ns = "common";
  const translations = await loadTranslations(locale, ns);

  return (
    <html
      className="notranslate"
      translate="no"
      lang={locale}
      dir={direction}
      style={
        embedColorScheme
          ? { colorScheme: embedColorScheme as string }
          : undefined
      }
      suppressHydrationWarning
      data-nextjs-router="app"
    >
      <head nonce={nonce}>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Pendo SDK install snippet
          dangerouslySetInnerHTML={{
            __html: `
            (function(apiKey){
              (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
              v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
              o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
              y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo-dev.pendo-dev.com/agent/static/'+apiKey+'/pendo.js';
              z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
            })('11868d0d-5894-42f6-9b1f-79a12328484e');
            `,
          }}
        />
        <style>{`
          :root {
            --font-sans: ${interFont.style.fontFamily.replace(/'/g, "")};
            --font-cal: ${calFont.style.fontFamily.replace(/'/g, "")};
          }
        `}</style>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-options='{"activationKey":"Meta+c"}'
          />
        )}
      </head>
      <body
        className="bg-subtle antialiased dark:bg-default"
        style={
          isEmbed
            ? {
                background: "transparent",
                // Keep the embed hidden till parent initializes and
                // - gives it the appropriate styles if UI instruction is there.
                // - gives iframe the appropriate height(equal to document height) which can only be known after loading the page once in browser.
                // - Tells iframe which mode it should be in (dark/light) - if there is a a UI instruction for that
                visibility: "hidden",
                // This in addition to visibility: hidden is to ensure that elements with specific opacity set are not visible
                opacity: 0,
              }
            : {
                visibility: "visible",
                opacity: 1,
              }
        }
      >
        <IconSprites />
        <SpeculationRules
          // URLs In Navigation
          prerenderPathsOnHover={[
            "/event-types",
            "/availability",
            "/bookings/upcoming",
            "/teams",
            "/apps",
          ]}
        />

        <Providers isEmbed={isEmbed} nonce={nonce} country={country}>
          <AppRouterI18nProvider
            translations={translations}
            locale={locale}
            ns={ns}
          >
            {children}
          </AppRouterI18nProvider>
        </Providers>
      </body>
    </html>
  );
}
