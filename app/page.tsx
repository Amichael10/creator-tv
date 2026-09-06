import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 bg-[#121212] p-8 rounded-2xl border border-[#242424] shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-600 text-white font-black text-2xl tracking-tighter shadow-md shadow-red-600/30">
            CTV
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">CreatorTV</h1>
          <p className="text-gray-400 text-sm">
            Turn internet creators and broadcasters into television stations.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link
            href="/connect"
            className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-200 shadow-lg shadow-red-600/20"
          >
            CONNECT TELEVISION
          </Link>
          
          <Link
            href="/tv"
            className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-gray-300 font-medium text-sm transition-colors duration-200 border border-[#333]"
          >
            Launch TV Client (/tv)
          </Link>
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t border-[#222]">
          Built for Hisense VIDAA Smart TVs & Constrained Browsers
        </div>
      </div>
    </main>
  );
}
