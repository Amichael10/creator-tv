'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Station {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  channelNumber?: number;
  accentColor?: string;
  youtubeHandle: string;
  mode: string;
  backdropUrl?: string;
  logoUrl?: string;
}

interface SearchResult {
  channelId: string;
  title: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  subscriberCount?: string;
  category?: string;
}

export default function ConnectPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono uppercase text-zinc-500">Loading companion...</span>
        </div>
      </div>
    }>
      <ConnectContent />
    </React.Suspense>
  );
}

function ConnectContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'code' | 'main'>('code');
  const [activeTab, setActiveTab] = useState<'remote' | 'guide' | 'search'>('remote');
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tuningSlug, setTuningSlug] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [, startTransition] = useTransition();

  const codeInputRef = useRef<HTMLInputElement>(null);

  const refreshStations = () => {
    fetch('/api/stations')
      .then((res) => res.json())
      .then((data) => {
        if (data.stations) {
          setStations(data.stations);
        }
      })
      .catch((err) => console.error('Failed to load stations:', err));
  };

  useEffect(() => {
    refreshStations();
  }, []);

  useEffect(() => {
    searchChannels('');
  }, []);

  // Handle URL query code (e.g. from QR scan: /connect?code=ABC123)
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      const sanitized = urlCode.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6);
      setCode(sanitized);
    }
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchChannels(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchChannels = async (q: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const val = e.target.value.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6);
    setCode(val);
  };

  const handleValidateAndConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter all 6 characters of the code shown on your TV screen.');
      return;
    }

    setError(null);
    setIsConnecting(true);

    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairCode: code,
          station: 'arise',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Pairing code "${code}" not found. Please verify the code displayed on your TV screen.`);
        setIsConnecting(false);
        return;
      }

      const matched = stations.find((s) => s.slug === 'arise') || {
        slug: 'arise',
        name: data.station?.name || 'ARISE News',
        tagline: data.station?.tagline || 'Live 24/7 Broadcast',
        category: 'news',
        youtubeHandle: '@arisenewschannel',
        mode: 'live-first',
        channelNumber: 1,
      };

      setActiveStation(matched);
      setStep('main');
      setActiveTab('remote');
      setRemoteMessage(`Connected to TV: ${matched.name}`);
      refreshStations();
    } catch (err) {
      setError('Network error connecting to TV server. Please ensure your device is online.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePairStation = async (stationSlug: string) => {
    setError(null);
    setTuningSlug(stationSlug);

    startTransition(async () => {
      try {
        const res = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pairCode: code,
            station: stationSlug,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to tune channel.');
          setTuningSlug(null);
          return;
        }

        const matched = stations.find((s) => s.slug === stationSlug) || {
          slug: stationSlug,
          name: data.station?.name || stationSlug,
          tagline: data.station?.tagline || 'Broadcast Station',
          category: data.station?.category || 'news',
          youtubeHandle: '',
          mode: 'live-first',
        };

        setActiveStation(matched);
        setRemoteMessage(`Tuned TV to ${matched.name}`);
        setActiveTab('remote');
        refreshStations();
      } catch (err) {
        setError('Network error sending tune command.');
      } finally {
        setTuningSlug(null);
      }
    });
  };

  const handleAddSearchResult = async (item: SearchResult) => {
    setError(null);
    setTuningSlug(item.handle);

    try {
      const res = await fetch('/api/stations/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: item.handle,
          title: item.title,
          bannerUrl: item.bannerUrl,
          avatarUrl: item.avatarUrl,
          description: item.description,
          category: item.category || 'creator',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add channel.');
        setTuningSlug(null);
        return;
      }

      const customStation = data.station;
      await handlePairStation(customStation.slug);
    } catch (err) {
      setError('Failed to tune creator channel.');
      setTuningSlug(null);
    }
  };

  const sendRemoteCommand = async (action: string, payload: any = {}) => {
    setRemoteMessage(null);
    try {
      const res = await fetch('/api/devices/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairCode: code,
          action,
          payload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (action === 'TUNE_STATION' && payload.station) {
          const matched = stations.find((s) => s.slug === payload.station);
          if (matched) setActiveStation(matched);
          setRemoteMessage(`TV tuned to ${matched?.name || payload.station}`);
        } else if (action === 'PLAY') {
          setIsPlaying(true);
          setRemoteMessage('▶ Playing');
        } else if (action === 'PAUSE') {
          setIsPlaying(false);
          setRemoteMessage('⏸ Paused');
        } else if (action === 'MUTE') {
          setIsMuted(true);
          setRemoteMessage('🔇 Muted');
        } else if (action === 'UNMUTE') {
          setIsMuted(false);
          setRemoteMessage('🔊 Unmuted');
        } else if (action === 'NEXT_VIDEO') {
          setRemoteMessage('⏭ Next Video');
        } else {
          setRemoteMessage(`Command: ${action}`);
        }

        setTimeout(() => setRemoteMessage(null), 3000);
      } else {
        setError(data.error || 'Command failed to reach TV');
      }
    } catch (err) {
      setError('Network error sending command');
    }
  };

  const flipChannel = (direction: 1 | -1) => {
    if (stations.length === 0) return;
    const currentIndex = stations.findIndex((s) => s.slug === activeStation?.slug);
    const nextIndex = (currentIndex + direction + stations.length) % stations.length;
    const nextStation = stations[nextIndex];
    if (nextStation) {
      sendRemoteCommand('TUNE_STATION', { station: nextStation.slug });
    }
  };

  const filteredStations = selectedCategory === 'all'
    ? stations
    : stations.filter((s) => s.category === selectedCategory);

  const quickSearchTags = ['BBC', 'CNN', 'MrBeast', 'MKBHD', 'Veritasium', 'Al Jazeera', 'Lofi Girl', 'NASA', 'DW News'];

  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between p-3 sm:p-6">
      
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center my-auto">
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-sm shadow-sm">
                CTV
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-none">CreatorTV</h1>
                <p className="text-[11px] text-zinc-400 mt-0.5">Companion Remote</p>
              </div>
            </Link>

            {step === 'main' && (
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 text-xs font-mono font-bold">
                  {code}
                </span>
                <button
                  onClick={() => {
                    setStep('code');
                    setActiveStation(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-1"
                  title="Disconnect TV"
                >
                  Exit
                </button>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 font-bold ml-2">✕</button>
            </div>
          )}

          {/* Status Toast */}
          {remoteMessage && (
            <div className="p-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-zinc-200 text-xs text-center font-medium shadow-sm flex items-center justify-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{remoteMessage}</span>
            </div>
          )}

          {/* =================================================================
              STEP 1: 6-Character TV Code Entry
              ================================================================= */}
          {step === 'code' && (
            <form onSubmit={handleValidateAndConnect} className="space-y-5 py-2">
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl font-bold text-white">Connect your TV</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Scan the QR code on your TV or type the 6-character code below:
                </p>
              </div>

              <div 
                className="cursor-pointer"
                onClick={() => codeInputRef.current?.focus()}
              >
                <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const char = code[index] || '';
                    const isCurrent = code.length === index;
                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-xl flex items-center justify-center text-xl font-mono font-bold transition-colors ${
                          char
                            ? 'bg-[#18181b] border-2 border-red-500 text-white'
                            : isCurrent
                            ? 'bg-[#18181b] border-2 border-zinc-400 text-white'
                            : 'bg-[#18181b] border border-[#27272a] text-zinc-600'
                        }`}
                      >
                        {char || (isCurrent ? <span className="w-1.5 h-4 bg-red-500 animate-pulse rounded" /> : '•')}
                      </div>
                    );
                  })}
                </div>

                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  autoFocus
                  className="opacity-0 absolute -z-10"
                />
              </div>

              <button
                type="submit"
                disabled={code.length !== 6 || isConnecting}
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <span>Connecting TV...</span>
                ) : (
                  <span>Connect to TV →</span>
                )}
              </button>

              <div className="text-center pt-1">
                <Link
                  href="/tv"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Need a TV display? Open /tv here
                </Link>
              </div>
            </form>
          )}

          {/* =================================================================
              STEP 2: Remote / Guide / Search Interface
              ================================================================= */}
          {step === 'main' && (
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
                <button
                  onClick={() => setActiveTab('remote')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 ${
                    activeTab === 'remote'
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>🎛️</span>
                  <span>Remote</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>📺</span>
                  <span>Guide</span>
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 ${
                    activeTab === 'search'
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>🔍</span>
                  <span>Search</span>
                </button>
              </div>

              {/* TAB 1: Remote Controls */}
              {activeTab === 'remote' && (
                <div className="space-y-4">
                  
                  {/* Now Playing Banner */}
                  <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Broadcasting on TV</span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate">
                        {activeStation?.name || 'ARISE News'}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {activeStation?.tagline || 'Live 24/7 Broadcast'}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded bg-[#27272a] text-emerald-400 text-xs font-mono font-bold flex-shrink-0">
                      CH {activeStation?.channelNumber ? (activeStation.channelNumber < 10 ? `0${activeStation.channelNumber}` : activeStation.channelNumber) : '01'}
                    </span>
                  </div>

                  {/* Playback Buttons */}
                  <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => sendRemoteCommand(isPlaying ? 'PAUSE' : 'PLAY')}
                        className={`py-3 px-3 rounded-xl font-bold text-xs transition-colors ${
                          isPlaying 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                      </button>

                      <button
                        onClick={() => sendRemoteCommand(isMuted ? 'UNMUTE' : 'MUTE')}
                        className="py-3 px-3 rounded-xl bg-[#27272a] hover:bg-[#333] text-zinc-200 font-bold text-xs transition-colors"
                      >
                        {isMuted ? '🔊 UNMUTE' : '🔇 MUTE'}
                      </button>

                      <button
                        onClick={() => sendRemoteCommand('NEXT_VIDEO')}
                        className="py-3 px-3 rounded-xl bg-[#27272a] hover:bg-[#333] text-zinc-200 font-bold text-xs transition-colors"
                      >
                        ⏭ NEXT
                      </button>
                    </div>

                    {/* Sequential Channel Stepper */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => flipChannel(1)}
                        className="py-2.5 px-3 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-zinc-200 font-bold text-xs transition-colors border border-[#2e2e34]"
                      >
                        ▲ CHANNEL UP
                      </button>

                      <button
                        onClick={() => flipChannel(-1)}
                        className="py-2.5 px-3 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-zinc-200 font-bold text-xs transition-colors border border-[#2e2e34]"
                      >
                        ▼ CHANNEL DOWN
                      </button>
                    </div>
                  </div>

                  {/* Quick Channel Grid */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Quick Channel Flip
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                      {stations.map((st) => {
                        const isCur = activeStation?.slug === st.slug;
                        return (
                          <button
                            key={st.slug}
                            onClick={() => sendRemoteCommand('TUNE_STATION', { station: st.slug })}
                            className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between h-16 ${
                              isCur
                                ? 'bg-red-950/40 border-red-600 text-white'
                                : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46] text-zinc-300'
                            }`}
                          >
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                            </span>
                            <span className="text-xs font-bold truncate">{st.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Channel Guide */}
              {activeTab === 'guide' && (
                <div className="space-y-3">
                  {/* Category Filter */}
                  <div className="flex space-x-1 overflow-x-auto pb-1 text-xs">
                    {['all', 'news', 'tech', 'science', 'music', 'creator'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                          selectedCategory === cat
                            ? 'bg-red-600 text-white'
                            : 'bg-[#18181b] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Stations List */}
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {filteredStations.map((st) => {
                      const isTuningThis = tuningSlug === st.slug;
                      const isCur = activeStation?.slug === st.slug;
                      return (
                        <div
                          key={st.slug}
                          className={`bg-[#18181b] border rounded-xl p-3 transition-colors flex items-center justify-between gap-2.5 ${
                            isCur ? 'border-red-600 bg-red-950/20' : 'border-[#27272a] hover:border-[#3f3f46]'
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono font-bold text-emerald-400">
                                CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                              </span>
                              <h3 className="text-xs font-bold text-white truncate">{st.name}</h3>
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate">{st.tagline}</p>
                          </div>

                          <button
                            onClick={() => handlePairStation(st.slug)}
                            disabled={isTuningThis}
                            className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap transition-colors flex-shrink-0"
                          >
                            {isTuningThis ? 'Tuning...' : isCur ? '✓ Playing' : 'Tune TV'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Search */}
              {activeTab === 'search' && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search channel or @handle..."
                      className="w-full bg-[#18181b] border border-[#27272a] focus:border-red-600 focus:outline-none rounded-xl pl-8 pr-8 py-2.5 text-xs text-white placeholder:text-zinc-500"
                    />
                    <span className="absolute left-2.5 top-2.5 text-zinc-500 text-xs">🔍</span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {quickSearchTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-400 font-medium whitespace-nowrap transition-colors border border-[#27272a] text-[11px]"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Search Results */}
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {isSearching ? (
                      <div className="py-6 text-center text-zinc-500 text-xs">
                        Searching YouTube...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-6 text-center text-zinc-500 text-xs">
                        No channels found. Type a creator name or handle like <code className="text-zinc-300">@mkbhd</code>.
                      </div>
                    ) : (
                      searchResults.map((item) => {
                        const isTuningThis = tuningSlug === item.handle;
                        return (
                          <div
                            key={item.channelId || item.handle}
                            className="bg-[#18181b] border border-[#27272a] hover:border-red-600/50 rounded-xl p-2.5 transition-colors flex items-center justify-between gap-2.5"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                              <p className="text-[11px] text-red-400 font-mono">{item.handle}</p>
                            </div>

                            <button
                              onClick={() => handleAddSearchResult(item)}
                              disabled={isTuningThis}
                              className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap transition-colors flex-shrink-0"
                            >
                              {isTuningThis ? 'Tuning...' : '▶ Cast'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      <footer className="text-center text-[11px] text-zinc-600 py-3">
        CreatorTV Companion • Instant Smart TV Remote
      </footer>

    </main>
  );
}
