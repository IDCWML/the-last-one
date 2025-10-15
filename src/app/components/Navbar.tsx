"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NavbarProps {
  name?: string;
  onLogout?: () => void;
}

export default function Navbar({ name, onLogout }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <nav className="w-full flex justify-between items-center px-6 py-3 bg-gray-200 dark:bg-gray-800 shadow-md">
      {/* Tombol navigasi */}
      <div className="flex items-center space-x-3">
        <Link
          href="/home"
          className="text-lg font-semibold text-gray-800 dark:text-white"
        >
          BookLend
        </Link>
        <Link
          href="/dashboard"
          className="px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link
          href="/history"
          className="px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          History
        </Link>
        <Link
          href="/input"
          className="px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Add Book
        </Link>
      </div>

      {/* User info + theme + logout */}
      <div className="flex items-center space-x-3">
        {name && (
          <span className="text-gray-700 dark:text-gray-200">
            Hello, {name}
          </span>
        )}

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
