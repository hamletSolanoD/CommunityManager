// app/editor/layout.tsx
import React from "react";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Sidebar from "~/app/editor/_components/mainSidebar";
import Topbar from "~/app/editor/_components/mainTopbar";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen">
      {/* Navbar lateral */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* Navbar superior */}
        <Topbar user={session.user} />

        {/* Contenido principal */}
        <main className="flex-1 p-4 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}