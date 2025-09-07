'use client';

import { User } from "next-auth";
import React from "react";

export default function mainTopbar({ user }: { user: User }) {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-4">
      <h1 className="text-lg font-bold">Editor</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">{user.name || user.email}</span>
        <button
          onClick={() => {
            window.location.href = "/api/auth/signout";
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}