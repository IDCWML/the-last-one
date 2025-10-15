import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center space-y-6 py-20">
      <h1 className="text-4xl font-bold">BookLend</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        &apos;Your Simple Library Borrowing System&apos;
      </p>

      <div className="space-x-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-md bg-primary text-white hover:bg-primary-600"
        >
          Login / Sign In
        </Link>
        <Link
          href="/about"
          className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700"
        >
          About
        </Link>
      </div>
    </section>
  );
}
