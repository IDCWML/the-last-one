"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

interface Book {
  id: number;
  title: string;
  author: string;
  stock: number;
  ageRestriction: number;
}

interface BorrowHistoryEntry {
  id: number;
  borrower: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

const getAgeDescription = (age: number) => {
  if (age >= 1 && age <= 6) return "Children";
  if (age >= 7 && age <= 12) return "Pre-teens";
  if (age >= 13 && age <= 17) return "Teens";
  if (age >= 18) return "Adults";
  return "Unknown";
};

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowDays, setBorrowDays] = useState(7); // Default 7 days
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalBorrowDays, setModalBorrowDays] = useState(7);


  useEffect(() => {
    const user = localStorage.getItem("userName") || "";
    setName(user);

    const savedBooks = JSON.parse(localStorage.getItem("books") || "[]");
    setBooks(savedBooks);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  // Borrow book
  const borrowBook = (book: Book, days: number) => {
    if (book.stock <= 0) {
      alert("Sorry, this book is out of stock.");
      return;
    }

    // Check age restriction
    const userAge = parseInt(localStorage.getItem("userAge") || "0");
    if (userAge < book.ageRestriction) {
      alert("Sorry, you do not meet the age requirement to borrow this book.");
      return;
    }

    // Check user borrowing limit
    const userBorrowLimit = parseInt(localStorage.getItem(`borrowLimit_${name}`) || "3"); // Default 3 books per user
    const currentBorrowed = JSON.parse(localStorage.getItem(`borrowHistory_${name}`) || "[]").filter((entry: BorrowHistoryEntry) => entry.status === "borrowed").length;
    if (currentBorrowed >= userBorrowLimit) {
      alert(`You have reached the maximum borrowing limit of ${userBorrowLimit} books. Please return some books before borrowing more.`);
      return;
    }

    const updatedBooks = books.map((b) => {
      if (b.id === book.id) return { ...b, stock: b.stock - 1 };
      return b;
    });
    setBooks(updatedBooks);
    localStorage.setItem("books", JSON.stringify(updatedBooks));

    const borrowHistory = JSON.parse(
      localStorage.getItem(`borrowHistory_${name}`) || "[]"
    );
    // Get today's date
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + days);
    const newEntry = {
      id: Date.now(),
      borrower: name || "guest",
      title: book.title,
      author: book.author,
      borrowDate: borrowDate.toLocaleDateString(),
      dueDate: dueDate.toLocaleDateString(),
      returnDate: null,
      status: "borrowed",
    };
    borrowHistory.push(newEntry);
    localStorage.setItem(`borrowHistory_${name}`, JSON.stringify(borrowHistory));

    // Also save to global history for public access
    const globalHistory = JSON.parse(localStorage.getItem("borrowHistory") || "[]");
    globalHistory.push(newEntry);
    localStorage.setItem("borrowHistory", JSON.stringify(globalHistory));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Navbar name={name} onLogout={handleLogout} />
      <div className="p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">Book List</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="border rounded-lg p-4 shadow-md flex flex-col justify-between bg-white dark:bg-gray-800"
            >
              <div>
                <h2 className="text-xl font-semibold">{book.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  by {book.author}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  Stock: {book.stock}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  Age Restriction: {book.ageRestriction}+ ({getAgeDescription(book.ageRestriction)})
                </p>
              </div>
              <button
                onClick={() => {
                  if (book.stock > 0) {
                    setSelectedBook(book);
                    setShowModal(true);
                  }
                }}
                disabled={book.stock <= 0}
                className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white ${
                  book.stock <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {book.stock <= 0 ? "Not Available" : "Borrow"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tenggat Waktu */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Borrow Confirmation</h2>
            <p className="mb-2">
              Book: <strong>{selectedBook.title}</strong>
            </p>
            <p className="mb-2">
              Author: <strong>{selectedBook.author}</strong>
            </p>
            <p className="mb-4">
              Borrower Name: <strong>{name || "Guest"}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Number of Borrowing Days (Max 14 days):
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={modalBorrowDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= 14) setModalBorrowDays(val);
                }}
                className="w-full px-3 py-2 rounded border dark:bg-gray-900"
              />
            </div>
            <p className="mb-4">
              Return Deadline: <strong>{new Date(Date.now() + modalBorrowDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  borrowBook(selectedBook, modalBorrowDays);
                  setShowModal(false);
                  setSelectedBook(null);
                  setModalBorrowDays(7);

                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBook(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
