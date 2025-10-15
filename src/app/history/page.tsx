"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import TableBorrow from "../components/TableBorrow";

interface BorrowEntry {
  id: number;
  borrower: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [history, setHistory] = useState<BorrowEntry[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("userName");
    if (!user) router.push("/login");
    else {
      setName(user);
      // Load global borrow history for all users (public history)
      const data = JSON.parse(localStorage.getItem("borrowHistory") || "[]");
      // Sort by borrowDate descending (newest first)
      const sortedData = data.sort((a: BorrowEntry, b: BorrowEntry) =>
        new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
      );
      setHistory(sortedData);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6 md:p-10">
      <Navbar name={name} onLogout={handleLogout} />
      <h1 className="text-2xl font-bold mb-6">Borrow History</h1>

      {history.length === 0 ? (
        <p>No books have been borrowed yet.</p>
      ) : (
        <TableBorrow rows={history} />
      )}
    </div>
  );
}
