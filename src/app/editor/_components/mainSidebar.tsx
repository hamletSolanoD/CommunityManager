'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function mainSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/editor/chatlist", label: "Chat List" },
    { href: "/editor/profile", label: "Profile" },
    { href: "/editor/settings", label: "Settings" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      <div className="p-4 text-xl font-bold">Editor Menu</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded ${
                  pathname === link.href ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}