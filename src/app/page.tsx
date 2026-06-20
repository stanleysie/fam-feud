import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-slate-800">
          FAMILY <span className="text-amber-500">FEUD</span>
        </h1>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-xl font-bold rounded-xl transition-colors shadow-lg"
          >
            Admin Panel
          </Link>
          <Link
            href="/game-view"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white text-xl font-bold rounded-xl transition-colors shadow-lg"
          >
            Game View
          </Link>
        </div>
      </div>
    </div>
  );
}
