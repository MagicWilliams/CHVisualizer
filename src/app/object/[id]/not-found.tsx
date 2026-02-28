import Link from "next/link";

export default function ObjectNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Object not found
      </h1>
      <Link
        href="/"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to collection
      </Link>
    </div>
  );
}
