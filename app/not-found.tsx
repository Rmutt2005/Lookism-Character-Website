import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white/70 backdrop-blur-md p-8 shadow-[0_18px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 animate-fade-in">
        <div className="text-sm font-medium text-slate-500">404</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Character not found
        </div>
        <div className="mt-3 text-sm leading-6 text-slate-600">
          The character you’re looking for doesn’t exist.
        </div>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
