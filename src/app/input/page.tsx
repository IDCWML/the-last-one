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

export default function InputPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [stock, setStock] = useState(1);
  const [ageRestriction, setAgeRestriction] = useState(1);
  // State to track which book is being edited (null if adding new book)
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Load user & books
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") router.push("/login");

    const user = localStorage.getItem("userName") || "guest";
    setName(user);

    const savedBooks = JSON.parse(localStorage.getItem("books") || "[]");
    setBooks(savedBooks);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  // Handle adding new book or editing existing book
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || stock < 1 || ageRestriction < 1) {
      alert("Please fill in all fields correctly");
      return;
    }

    // Check if title is unique (except for editing the same book)
    const existingBooks = JSON.parse(localStorage.getItem("books") || "[]");
    const titleExists = existingBooks.some((book: Book) =>
      book.title.toLowerCase() === title.toLowerCase() &&
      (!editingBook || book.id !== editingBook.id)
    );
    if (titleExists) {
      alert("A book with this title already exists. Please choose a different title.");
      return;
    }

    if (editingBook) {
      // Update existing book in the list
      const updatedBooks = books.map((book) =>
        book.id === editingBook.id
          ? { ...book, title, author, stock, ageRestriction }
          : book
      );
      setBooks(updatedBooks);
      localStorage.setItem("books", JSON.stringify(updatedBooks));
      setEditingBook(null); // Exit edit mode
    } else {
      // Add new book to the list
      const newBook: Book = {
        id: Date.now(),
        title,
        author,
        stock,
        ageRestriction,
      };
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      localStorage.setItem("books", JSON.stringify(updatedBooks));
    }

    // Reset form fields after add/edit
    setTitle("");
    setAuthor("");
    setStock(1);
    setAgeRestriction(1);
  };

  // Hapus buku
  const deleteBook = (bookId: number) => {
    if (!confirm("Delete this book?")) return;
    const updatedBooks = books.filter((b) => b.id !== bookId);
    setBooks(updatedBooks);
    localStorage.setItem("books", JSON.stringify(updatedBooks));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6 md:p-10">
      {/* Navbar */}
      <Navbar name={name} onLogout={handleLogout} />

      {/* Form Add/Edit Book */}
      <div className="max-w-lg bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">{editingBook ? "Edit Book" : "Add Book"}</h2>
        <form onSubmit={handleAddBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded border dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock (Number of Books)</label>
            <input
              type="number"
              placeholder="Enter number of books"
              min={1}
              value={stock}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setStock(isNaN(val) ? 1 : val);
              }}
              className="w-full px-3 py-2 rounded border dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age Restriction</label>
            <select
              value={ageRestriction}
              onChange={(e) => setAgeRestriction(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded border dark:bg-gray-900"
            >
              <option value={1}>Child (1-6)</option>
              <option value={7}>Pre-teen (7-12)</option>
              <option value={13}>Teen (13-17)</option>
              <option value={18}>Adults (18+)</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              {editingBook ? "Update Book" : "Add Book"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setAuthor("");
                setStock(1);
                setAgeRestriction(1);
                setEditingBook(null);
              }}
              className="px-4 py-2 border rounded"
            >
              {editingBook ? "Cancel" : "Reset"}
            </button>
          </div>
        </form>
      </div>

      {/* List Buku */}
      <h2 className="text-2xl font-bold mb-4">Current Books</h2>
      {books.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No books in the library yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="p-4 rounded border bg-gray-50 dark:bg-gray-700 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{book.title}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {book.author}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  Stock: {book.stock}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  Age Restriction: {book.ageRestriction}+
                </p>
              </div>
              <div className="flex space-x-2">
                {/* Edit button - fills form with book data for editing */}
                <button
                  onClick={() => {
                    setEditingBook(book);
                    setTitle(book.title);
                    setAuthor(book.author);
                    setStock(book.stock);
                    setAgeRestriction(book.ageRestriction);
                  }}
                  className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white shadow"
                >
                  Edit
                </button>
                {/* Delete button - removes book from list */}
                <button
                  onClick={() => deleteBook(book.id)}
                  className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
