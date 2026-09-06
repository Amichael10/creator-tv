'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface StationPreview {
  slug: string;
  name: string;
  category: string;
  channelNumber: number;
  tagline: string;
  backdropUrl: string;
  logoUrl?: string;
  subscribers?: string;
  badge: string;
}

const FEATURED_STATIONS: StationPreview[] = [
  {
    slug: 'arise',
    name: 'ARISE News',
    category: 'NEWS',
    channelNumber: 1,
    tagline: '24-hour news, global politics, business and breaking coverage.',
    backdropUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80&fit=crop',
    logoUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kM3y2sW8Bf4v0S0q7zK3B6G6_p1x2q3=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '1.2M Subs',
    badge: 'LIVE BROADCAST',
  },
  {
    slug: 'mkbhd',
    name: 'MKBHD Tech TV',
    category: 'TECH',
    channelNumber: 8,
    tagline: 'Crisp tech reviews, smartphone spotlights, and gadget deep dives.',
    backdropUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&fit=crop',
    subscribers: '19.2M Subs',
    badge: '24/7 CONTINUOUS',
  },
  {
    slug: 'veritasium',
    name: 'Veritasium',
    category: 'SCIENCE',
    channelNumber: 9,
    tagline: 'An element of truth: incredible physics, experiments, and history.',
    backdropUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=80&fit=crop',
    subscribers: '16.5M Subs',
    badge: '24/7 CONTINUOUS',
  },
  {
    slug: 'mrbeast',
    name: 'MrBeast TV',
    category: 'ENTERTAINMENT',
    channelNumber: 11,
    tagline: 'World-record entertainment, massive challenges, and spectacles.',
    backdropUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80&fit=crop',
    subscribers: '330M Subs',
    badge: '24/7 CONTINUOUS',
  },
  {
    slug: 'bbc',
    name: 'BBC News',
    category: 'NEWS',
    channelNumber: 13,
    tagline: 'Trusted global journalism and in-depth international reports.',
    backdropUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1200&q=80&fit=crop',
    subscribers: '16.1M Subs',
    badge: 'LIVE BROADCAST',
  },
  {
    slug: 'kurzgesagt',
    name: 'Kurzgesagt',
    category: 'SCIENCE',
    channelNumber: 10,
    tagline: 'Science, philosophy, the universe, and animated deep dives in a nutshell.',
    backdropUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80&fit=crop',
    subscribers: '22.8M Subs',
    badge: '24/7 CONTINUOUS',
  },
  {
    slug: 'lofigirl',
    name: 'Lofi Girl',
    category: 'MUSIC',
    channelNumber: 6,
    tagline: 'Relaxing beats to study, work, game, and chill to 24/7.',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80&fit=crop',
    subscribers: '14.4M Subs',
    badge: 'LIVE 24/7 RADIO',
  },
];

export default function HomePage() {
  const [selectedPreview, setSelectedPreview] = useState<StationPreview>(FEATURED_STATIONS[0]);

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-red-600 selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Ambient Radial Glows (Netflix/Plex Style) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-red-600/20 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[500px] bg-red-950/25 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[500px] bg-emerald-950/20 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#060606_90%)]" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-50 w-full border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-black text-white text-xl tracking-tight shadow-lg shadow-red-600/40 border border-red-400/30">
              CTV
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">CreatorTV</span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">Smart Television Broadcast Network</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/tv"
              className="px-4 py-2 rounded-xl bg-[#181818] hover:bg-[#242424] text-gray-300 hover:text-white text-xs sm:text-sm font-bold transition-all border border-white/10 flex items-center space-x-1.5"
            >
              <span>📺</span>
              <span>TV Client</span>
            </Link>

            <Link
              href="/connect"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 flex items-center space-x-1.5"
            >
              <span>📱</span>
              <span>Connect Remote</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        
        {/* =================================================================
            HERO SECTION: Cinematic Headline + Simulator
            ================================================================= */}
        <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-bold uppercase tracking-wider text-[11px]">Live Broadcast Engine</span>
            <span className="text-gray-600">•</span>
            <span>Zero App Installation Required</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mx-auto drop-shadow-2xl">
            Turn Internet Creators Into <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              24/7 Television Channels.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-normal">
            Experience YouTube creators, live global news, podcasts, and video catalogs as seamless, continuous television stations. Controlled instantly from your phone with 1-tap pairing.
          </p>

          {/* Call-to-Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/connect"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base transition-all duration-200 shadow-xl shadow-red-600/40 hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <span>📱</span>
              <span>Connect Your TV</span>
            </Link>

            <Link
              href="/tv"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#161616] hover:bg-[#202020] text-gray-200 hover:text-white font-bold text-base transition-all duration-200 border border-white/15 hover:border-white/30 flex items-center justify-center space-x-2"
            >
              <span>📺</span>
              <span>Launch TV Display</span>
            </Link>
          </div>

          {/* Hardware Compatibility Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 font-medium">
            <span>Runs natively on:</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">Hisense VIDAA</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">Samsung Tizen</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">LG webOS</span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">FireTV & Android TV</span>
          </div>

          {/* =================================================================
              INTERACTIVE SMART-TV SIMULATOR (Plex/Netflix Style)
              ================================================================= */}
          <div className="mt-16 sm:mt-24 max-w-5xl mx-auto">
            <div className="tv-screen-bezel bg-[#0f0f0f] border-2 border-white/10 p-2 sm:p-4 rounded-3xl shadow-2xl relative">
              
              {/* Simulated Screen Body */}
              <div 
                className="relative rounded-2xl overflow-hidden aspect-[16/9] w-full bg-cover bg-center transition-all duration-500 flex flex-col justify-between p-4 sm:p-10 text-left"
                style={{
                  backgroundImage: `url(${selectedPreview.backdropUrl})`,
                }}
              >
                {/* Cinematic Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />

                {/* Top Screen Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-lg bg-[#00FF66]/20 border border-[#00FF66]/60 text-[#00FF66] font-mono font-black text-xs sm:text-sm">
                      CH {selectedPreview.channelNumber < 10 ? `0${selectedPreview.channelNumber}` : selectedPreview.channelNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-300">
                      {selectedPreview.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Audio Waveform Simulator */}
                    <div className="flex items-end space-x-1 h-4 px-2 py-0.5 rounded bg-black/50 border border-white/10">
                      <span className="w-1 bg-[#00FF66] rounded-full eq-bar-1" />
                      <span className="w-1 bg-[#00FF66] rounded-full eq-bar-2" />
                      <span className="w-1 bg-[#00FF66] rounded-full eq-bar-3" />
                      <span className="w-1 bg-[#00FF66] rounded-full eq-bar-4" />
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[10px] sm:text-xs flex items-center space-x-1.5 tracking-wider shadow-lg shadow-red-600/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{selectedPreview.badge}</span>
                    </span>
                  </div>
                </div>

                {/* Middle Content */}
                <div className="relative z-10 max-w-xl space-y-2 sm:space-y-4 my-auto">
                  <div className="text-2xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {selectedPreview.name}
                  </div>
                  <p className="text-xs sm:text-base text-gray-300 line-clamp-2 leading-relaxed drop-shadow">
                    {selectedPreview.tagline}
                  </p>
                  
                  <div className="pt-2 flex items-center space-x-3">
                    <Link
                      href={`/connect?station=${selectedPreview.slug}`}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-600/30 flex items-center space-x-2"
                    >
                      <span>▶</span>
                      <span>TUNE ON TELEVISION</span>
                    </Link>
                  </div>
                </div>

                {/* Bottom Interactive Channel Switcher Row */}
                <div className="relative z-10 pt-4 border-t border-white/10">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Interactive Channel Lineup (Click to Switch):
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {FEATURED_STATIONS.map((st) => {
                      const isSel = selectedPreview.slug === st.slug;
                      return (
                        <button
                          key={st.slug}
                          onClick={() => setSelectedPreview(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                            isSel
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105 border border-red-400'
                              : 'bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white border border-white/10'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-emerald-400">
                            CH{st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber}
                          </span>
                          <span>{st.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            FEATURED CHANNELS ROW (Netflix Style Poster Rails)
            ================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-red-500 text-xs font-black uppercase tracking-widest mb-1">
                Featured 24/7 Lineup
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Broadcast Channels</h2>
            </div>
            <Link
              href="/connect"
              className="text-xs sm:text-sm text-gray-400 hover:text-white font-semibold transition-colors flex items-center space-x-1"
            >
              <span>View All in Companion</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_STATIONS.slice(0, 4).map((station) => (
              <div
                key={station.slug}
                onClick={() => setSelectedPreview(station)}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between"
              >
                <div 
                  className="aspect-[16/10] w-full bg-cover bg-center relative transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${station.backdropUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/50" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded bg-black/80 text-[#00FF66] font-mono text-[11px] font-black border border-[#00FF66]/40">
                      CH {station.channelNumber < 10 ? `0${station.channelNumber}` : station.channelNumber}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold backdrop-blur-md uppercase">
                      {station.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 bg-[#141414]/90">
                  <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors">
                    {station.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {station.tagline}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>{station.subscribers}</span>
                    <span className="text-red-400 font-bold group-hover:underline">Preview Stream →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            FEATURE BENTO GRID (Plex / Apple TV Inspired)
            ================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-red-500 text-xs font-black uppercase tracking-widest mb-1">
              Engineered For The Living Room
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              A True Lean-Back Television Experience
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-400">
              Unlike clunky websites or apps that stop after every video, CreatorTV runs like traditional cable with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-white/10 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl font-black">
                ⚡
              </div>
              <h3 className="text-xl font-black text-white">1-Tap Instant Mobile Pairing</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Scan the on-screen QR code with your phone camera or enter the 6-digit sync code. No logins, passwords, or app stores required.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-white/10 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl font-black">
                🔁
              </div>
              <h3 className="text-xl font-black text-white">24/7 Continuous Auto-Loop</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                When a video ends, the next creator video plays immediately without prompting you to click or search. True lean-back television.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-white/10 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-2xl font-black">
                🔍
              </div>
              <h3 className="text-xl font-black text-white">Live Creator Search & Cast</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Search any YouTube channel by name or handle (e.g. <span className="text-red-400 font-mono">@mkbhd</span>) from your phone and cast it immediately to your TV.
              </p>
            </div>

          </div>
        </section>

        {/* =================================================================
            HOW IT WORKS STEP RAIL
            ================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How To Connect in 15 Seconds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="glass-panel p-6 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black text-lg mx-auto flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">Open Browser on TV</h3>
              <p className="text-xs text-gray-400">
                Launch the built-in browser on your Hisense, Samsung, or LG TV and go to <span className="text-red-400 font-mono">creator-tv.vercel.app/tv</span>.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black text-lg mx-auto flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">Scan QR on Phone</h3>
              <p className="text-xs text-gray-400">
                Scan the QR code with your phone camera or visit <span className="text-red-400 font-mono">/connect</span> and enter the 6-character code.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-lg shadow-red-600/40">
                3
              </div>
              <h3 className="text-base font-bold text-white">Lean Back & Watch</h3>
              <p className="text-xs text-gray-400">
                Your TV instantly tunes to the broadcast station. Flip channels or control playback directly from your phone remote.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#080808] py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 space-y-3">
        <div className="flex items-center justify-center space-x-6 text-gray-400 font-medium">
          <Link href="/tv" className="hover:text-white transition-colors">TV Client (/tv)</Link>
          <span>•</span>
          <Link href="/connect" className="hover:text-white transition-colors">Phone Companion (/connect)</Link>
          <span>•</span>
          <a href="https://github.com/Amichael10/creator-tv" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <p>© 2026 CreatorTV Network. Optimized for smart TVs, mobile companions & web browsers.</p>
      </footer>

    </div>
  );
}
