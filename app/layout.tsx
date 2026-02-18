import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

// Configure Next.js optimized Manrope font
const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expenso",
  description: "finance tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The "dark" class forces Tailwind's dark mode palette to activate
    <html lang="en" className="dark">
      <head>
        {/* Google Material Icons required for the UI components */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        // Apply the optimized font and our specific dark mode background colors
        className={`${manrope.className} bg-background-dark text-text-primary antialiased`}
      >
        <Toaster position="top-center" theme="dark" />
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}