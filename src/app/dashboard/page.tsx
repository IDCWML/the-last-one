"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import TableBorrow from "../components/TableBorrow";

interface Book {
  id: number;
  title: string;
  author: string;
  stock: number;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<BorrowEntry[]>([]);
  // State untuk menyimpan batas peminjaman user, diambil dari localStorage
  const [userBorrowLimit, setUserBorrowLimit] = useState(3);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    // Pastikan kode ini hanya berjalan di sisi klien (browser), bukan server
    if (typeof window === "undefined") return;

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") router.push("/login");

    const user = localStorage.getItem("userName");
    setName(user || "");

    const savedBooks = JSON.parse(localStorage.getItem("books") || "[]");
    setBooks(savedBooks);

    const history = JSON.parse(
      localStorage.getItem(`borrowHistory_${user}`) || "[]"
    );
    setBorrowHistory(history);

    const limit = parseInt(localStorage.getItem(`borrowLimit_${user}`) || "3");
    setUserBorrowLimit(limit);

    // Check for books due tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString();

    const dueTomorrowBooks = history.filter(
      (entry: BorrowEntry) =>
        entry.status === "borrowed" && entry.dueDate === tomorrowStr
    );
    if (dueTomorrowBooks.length > 0) {
      const bookTitles = dueTomorrowBooks
        .map((book: BorrowEntry) => book.title)
        .join(", ");
      setPopupMessage(
        `Anda memiliki waktu 1 hari lagi untuk mengembalikan buku: ${bookTitles}`
      );
      setShowPopup(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  const handleReturn = (id: number) => {
    if (!confirm("Are you sure you want to return this book?")) return;

    const updatedHistory = borrowHistory.map((entry) => {
      if (entry.id === id && entry.status === "borrowed") {
        // Update book stock
        const updatedBooks = books.map((book) => {
          if (book.title === entry.title) {
            return { ...book, stock: book.stock + 1 };
          }
          return book;
        });
        setBooks(updatedBooks);
        localStorage.setItem("books", JSON.stringify(updatedBooks));

        // Update history
        return {
          ...entry,
          status: "returned",
          returnDate: new Date().toLocaleDateString(),
        };
      }
      return entry;
    });
    setBorrowHistory(updatedHistory);
    localStorage.setItem(
      `borrowHistory_${name}`,
      JSON.stringify(updatedHistory)
    );

    // Also update global history
    const globalHistory = JSON.parse(
      localStorage.getItem("borrowHistory") || "[]"
    );
    const updatedGlobalHistory = globalHistory.map((entry: BorrowEntry) =>
      entry.id === id
        ? {
            ...entry,
            status: "returned",
            returnDate: new Date().toLocaleDateString(),
          }
        : entry
    );
    localStorage.setItem("borrowHistory", JSON.stringify(updatedGlobalHistory));
  };

  const borrowedBooks = borrowHistory.filter(
    (entry) => entry.status === "borrowed"
  );

  const currentBorrowedCount = borrowedBooks.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6 md:p-10">
      {/* Navbar */}
      <Navbar name={name} onLogout={handleLogout} />

      <h1 className="text-2xl font-bold mb-6 mt-6">Dashboard</h1>

      {/* Navigasi cepat */}
      <div className="space-y-3 max-w-md mb-6">
        <Link
          href="/home"
          className="block px-4 py-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Home
        </Link>
        <Link
          href="/history"
          className="block px-4 py-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Borrow History
        </Link>
        <Link
          href="/input"
          className="block px-4 py-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Add / Edit Book
        </Link>
      </div>

      {/* Info total buku */}
      <div className="mt-6 mb-6">
        <p className="font-semibold text-lg">Total Books: {books.length}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your Borrowing Limit: {currentBorrowedCount}/{userBorrowLimit} books
        </p>
      </div>

      {/* Buku yang sedang dipinjam */}
      <h2 className="text-xl font-bold mb-4">Books Currently Borrowed</h2>
      {borrowedBooks.length === 0 ? (
        <p>No books are currently borrowed.</p>
      ) : (
        <TableBorrow rows={borrowedBooks} onReturn={handleReturn} />
      )}

      {/* Popup Reminder */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Pengingat Tenggat Waktu</h2>
            <p className="mb-4">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
