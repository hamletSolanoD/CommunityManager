// app/layout.tsx
import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { auth } from "~/server/auth";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Atlas Community",
  description: "Plataforma de gestión de conocimiento y cursos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="es" className={`${GeistSans.variable}`}>
      <body>
        <SessionProvider session={session}>
          <TRPCReactProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
              }}
            />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}