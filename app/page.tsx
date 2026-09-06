import React from 'react';
import Link from 'next/link';
import { getAllStations } from '@/lib/stations';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const stations = getAllStations();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#09090b]/90 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-base tracking-tight shadow-sm">
              CTV
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white">CreatorTV</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#27272a] text-zinc-400">
                Live TV
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/tv"
              className="px-3.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-white text-xs font-semibold transition-colors border border-[#27272a]"
            >
              Open on TV (/tv)
            </Link>
            <Link
              href="/connect"
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Connect Remote
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 flex-1 w-full">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>24/7 Smart TV Broadcast Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Watch YouTube channels like live TV on any screen.
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Turn your favorite creators, global news networks, and continuous live feeds into traditional television stations. Control playback from your phone with zero app installations.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              href="/connect"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors text-center shadow-md"
            >
              📱 Connect Phone Remote
            </Link>
            <Link
              href="/tv"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-200 hover:text-white font-semibold text-sm transition-colors border border-[#27272a] text-center"
            >
              📺 Launch TV Client
            </Link>
          </div>
        </section>

        {/* How It Works (Simple 3 Steps) */}
        <section className="border border-[#27272a] bg-[#121215] rounded-2xl p-6 sm:p-8">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#27272a] text-zinc-300 font-bold text-sm mx-auto flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Open on Your TV</h3>
              <p className="text-xs text-zinc-400">
                Launch the built-in browser on your smart TV (Hisense, Samsung, LG, FireTV) and go to <code className="text-zinc-200 bg-[#1e1e24] px-1 py-0.5 rounded">/tv</code>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#27272a] text-zinc-300 font-bold text-sm mx-auto flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Pair With Phone</h3>
              <p className="text-xs text-zinc-400">
                Scan the on-screen QR code or visit <code className="text-zinc-200 bg-[#1e1e24] px-1 py-0.5 rounded">/connect</code> on your phone and type the 6-digit code.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm mx-auto flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Lean Back & Watch</h3>
              <p className="text-xs text-zinc-400">
                Channels play continuously 24/7 without stopping between videos. Search any creator to broadcast.
              </p>
            </div>
          </div>
        </section>

        {/* Channel Directory Lineup */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Channel Directory</h2>
              <p className="text-xs text-zinc-400">Curated 24/7 broadcast stations ready to play.</p>
            </div>
            <Link
              href="/connect"
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              + Search Any YouTube Channel →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map((st) => (
              <div
                key={st.slug}
                className="bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] rounded-xl p-4 transition-colors flex items-start justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                      CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {st.category}
                    </span>
                    {st.mode === 'live-first' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600/20 text-red-400">
                        LIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{st.name}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{st.tagline}</p>
                </div>

                <Link
                  href={`/connect?station=${st.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1c20] hover:bg-red-600 text-zinc-300 hover:text-white text-xs font-bold transition-colors border border-[#2e2e34] whitespace-nowrap flex-shrink-0"
                >
                  Tune TV
                </Link>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] py-6 px-4 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center space-x-4 mb-2 font-medium">
          <Link href="/tv" className="hover:text-zinc-300 transition-colors">TV Client</Link>
          <span>•</span>
          <Link href="/connect" className="hover:text-zinc-300 transition-colors">Phone Remote</Link>
          <span>•</span>
          <a href="https://github.com/Amichael10/creator-tv" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
        </div>
        <p>© 2026 CreatorTV. Designed for Hisense VIDAA, Samsung, LG & smart-TV browsers.</p>
      </footer>

    </div>
  );
}
