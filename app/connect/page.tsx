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
      <div className="min-h-screen bg-[#060606] flex items-center justify-center text-gray-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase">Loading Companion...</span>
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

  // Load available stations from backend API
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

  // Handle initial search load
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

  // Debounced search effect
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

  // Immediate TV pairing on code submit
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
      setRemoteMessage(`Connected to TV! Broadcasting ${matched.name}.`);
      refreshStations();
    } catch (err) {
      setError('Network connection error. Please make sure your phone and TV are online.');
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
          setError(data.error || 'Failed to connect TV. Please verify the code.');
          setTuningSlug(null);
          return;
        }

        const matched = stations.find((s) => s.slug === stationSlug) || {
          slug: stationSlug,
          name: data.station?.name || stationSlug,
          tagline: data.station?.tagline || 'Connected Broadcast Station',
          category: data.station?.category || 'news',
          youtubeHandle: '',
          mode: 'live-first',
        };

        setActiveStation(matched);
        setRemoteMessage(`Tuned TV to ${matched.name}!`);
        setActiveTab('remote');
        refreshStations();
      } catch (err) {
        setError('Network error connecting to CreatorTV server. Please try again.');
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
          setRemoteMessage('▶ Playback resumed on TV');
        } else if (action === 'PAUSE') {
          setIsPlaying(false);
          setRemoteMessage('⏸ Playback paused on TV');
        } else if (action === 'MUTE') {
          setIsMuted(true);
          setRemoteMessage('🔇 TV Muted');
        } else if (action === 'UNMUTE') {
          setIsMuted(false);
          setRemoteMessage('🔊 TV Unmuted');
        } else if (action === 'NEXT_VIDEO') {
          setRemoteMessage('⏭ Advanced to next video');
        } else {
          setRemoteMessage(`Command sent: ${action}`);
        }

        setTimeout(() => setRemoteMessage(null), 3000);
      } else {
        setError(data.error || 'Command failed to reach TV');
      }
    } catch (err) {
      setError('Network error sending remote command');
    }
  };

  // Channel offset navigation (CH + / CH -)
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
    <main className="min-h-screen bg-[#060606] text-white selection:bg-red-600 selection:text-white flex flex-col justify-between p-3 sm:p-6 relative overflow-hidden">
      
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-red-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[350px] bg-emerald-950/15 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10 flex-1 flex flex-col justify-center my-auto">
        <div className="bg-[#101010]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 space-y-5">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-black text-white text-lg tracking-tight shadow-md shadow-red-600/30 border border-red-400/30 group-hover:scale-105 transition-transform">
                CTV
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight leading-none">CreatorTV</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">Companion & Remote</p>
              </div>
            </Link>

            {step === 'main' && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">{code}</span>
                </div>
                <button
                  onClick={() => {
                    setStep('code');
                    setActiveStation(null);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 transition-colors"
                  title="Disconnect TV"
                >
                  Exit
                </button>
              </div>
            )}
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-950/90 border border-red-600/60 rounded-2xl text-red-200 text-xs sm:text-sm flex items-start justify-between shadow-lg shadow-red-950/40 animate-fade-in">
              <div className="flex items-start space-x-2">
                <span className="text-red-400 font-bold text-base leading-none">⚠️</span>
                <span className="leading-snug">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 font-bold ml-2 hover:text-white">✕</button>
            </div>
          )}

          {/* Status Toast */}
          {remoteMessage && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-600/60 rounded-2xl text-emerald-200 text-xs sm:text-sm text-center font-semibold shadow-lg shadow-emerald-950/50 animate-fade-in flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{remoteMessage}</span>
            </div>
          )}

          {/* =================================================================
              STEP 1: 6-Character TV Code Entry (Segmented Glass Inputs)
              ================================================================= */}
          {step === 'code' && (
            <form onSubmit={handleValidateAndConnect} className="space-y-6 py-2">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold">
                  <span>📺</span>
                  <span>Smart TV Pairing</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Connect your TV</h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto">
                  Scan the QR code on your TV screen or enter the 6-character code below:
                </p>
              </div>

              {/* Segmented Code Display Boxes */}
              <div 
                className="cursor-pointer"
                onClick={() => codeInputRef.current?.focus()}
              >
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5 max-w-sm mx-auto">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const char = code[index] || '';
                    const isCurrent = code.length === index;
                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-mono font-black transition-all ${
                          char
                            ? 'bg-red-600/15 border-2 border-red-500 text-white shadow-lg shadow-red-600/20'
                            : isCurrent
                            ? 'bg-[#1c1c1c] border-2 border-white text-white scale-105 shadow-md'
                            : 'bg-[#181818] border border-white/15 text-gray-600'
                        }`}
                      >
                        {char || (isCurrent ? <span className="w-2 h-5 bg-red-500 animate-pulse rounded" /> : '•')}
                      </div>
                    );
                  })}
                </div>

                {/* Hidden input capturing typing for universal mobile compatibility */}
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

              <div className="text-center">
                <p className="text-[11px] text-gray-500 font-mono">
                  Code format: 6 uppercase alphanumeric characters (e.g. 7X9K2P)
                </p>
              </div>

              <button
                type="submit"
                disabled={code.length !== 6 || isConnecting}
                className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-black text-sm sm:text-base transition-all duration-200 shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting TV...</span>
                  </>
                ) : (
                  <span>Connect & Launch Remote →</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/tv"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline"
                >
                  Need a TV screen? Open the TV Web Client here
                </Link>
              </div>
            </form>
          )}

          {/* =================================================================
              STEP 2: Main Companion Experience (Tabs: Remote, Guide, Search)
              ================================================================= */}
          {step === 'main' && (
            <div className="space-y-4">
              
              {/* Top Navigation Pill Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-[#181818] p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => setActiveTab('remote')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'remote'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🎛️</span>
                  <span>Remote</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>📺</span>
                  <span>Guide</span>
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'search'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🔍</span>
                  <span>Search</span>
                </button>
              </div>

              {/* ----------------------------------------------------
                  TAB 1: Tactile TV Remote Control
                  ---------------------------------------------------- */}
              {activeTab === 'remote' && (
                <div className="space-y-4">
                  
                  {/* Now Broadcasting Hero Card */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/60 bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0d0d0d] p-4 sm:p-5 shadow-2xl">
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {/* Live Equalizer Animation */}
                          <div className="flex items-end space-x-0.5 h-3">
                            <span className="w-1 bg-[#00FF66] rounded-full eq-bar-1" />
                            <span className="w-1 bg-[#00FF66] rounded-full eq-bar-2" />
                            <span className="w-1 bg-[#00FF66] rounded-full eq-bar-3" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF66]">
                            Now Broadcasting
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white truncate drop-shadow">
                          {activeStation?.name || 'ARISE News'}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {activeStation?.tagline || 'Live 24/7 Broadcast Stream'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-mono font-black shadow-md shadow-red-600/30">
                          CH {activeStation?.channelNumber ? (activeStation.channelNumber < 10 ? `0${activeStation.channelNumber}` : activeStation.channelNumber) : '01'}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                          {activeStation?.category || 'BROADCAST'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Tactile Remote Button Matrix */}
                  <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                      Playback Controls
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => sendRemoteCommand(isPlaying ? 'PAUSE' : 'PLAY')}
                        className={`py-4 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                          isPlaying 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        }`}
                      >
                        {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                      </button>

                      <button
                        onClick={() => sendRemoteCommand(isMuted ? 'UNMUTE' : 'MUTE')}
                        className="py-4 px-3 rounded-2xl bg-[#222] hover:bg-[#2c2c2c] text-gray-200 font-black text-xs sm:text-sm transition-all border border-white/5 active:scale-95"
                      >
                        {isMuted ? '🔊 UNMUTE' : '🔇 MUTE'}
                      </button>

                      <button
                        onClick={() => sendRemoteCommand('NEXT_VIDEO')}
                        className="py-4 px-3 rounded-2xl bg-[#222] hover:bg-[#2c2c2c] text-gray-200 font-black text-xs sm:text-sm transition-all border border-white/5 active:scale-95"
                      >
                        ⏭ NEXT
                      </button>
                    </div>

                    {/* Sequential Channel Stepper */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => flipChannel(1)}
                        className="py-3 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] text-white font-black text-xs transition-all border border-white/10 flex items-center justify-center space-x-1.5 active:scale-95"
                      >
                        <span>▲</span>
                        <span>CHANNEL UP</span>
                      </button>

                      <button
                        onClick={() => flipChannel(-1)}
                        className="py-3 px-3 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] text-white font-black text-xs transition-all border border-white/10 flex items-center justify-center space-x-1.5 active:scale-95"
                      >
                        <span>▼</span>
                        <span>CHANNEL DOWN</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Channel Lineup Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      <span>Quick Channel Flip</span>
                      <button
                        onClick={() => setActiveTab('guide')}
                        className="text-red-400 hover:text-red-300 font-semibold normal-case text-xs"
                      >
                        View All →
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {stations.map((st) => {
                        const isCur = activeStation?.slug === st.slug;
                        return (
                          <button
                            key={st.slug}
                            onClick={() => sendRemoteCommand('TUNE_STATION', { station: st.slug })}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 active:scale-95 ${
                              isCur
                                ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-600/20'
                                : 'bg-[#181818] border-white/5 hover:border-white/20 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-mono font-bold text-[#00FF66]">
                                CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-gray-400">{st.category}</span>
                            </div>
                            <span className="text-xs font-bold truncate">{st.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  TAB 2: Netflix-Style Channel Guide
                  ---------------------------------------------------- */}
              {activeTab === 'guide' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-white">Broadcast Channels</h2>
                      <p className="text-xs text-gray-400">Select any channel to tune your TV instantly.</p>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs">
                    {['all', 'news', 'tech', 'science', 'music', 'creator'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                          selectedCategory === cat
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-[#1c1c1c] text-gray-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Station Cards Grid */}
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {filteredStations.map((st) => {
                      const isTuningThis = tuningSlug === st.slug;
                      const isCur = activeStation?.slug === st.slug;
                      return (
                        <div
                          key={st.slug}
                          className={`bg-[#181818] border rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3 ${
                            isCur ? 'border-red-500 bg-red-950/20' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {st.logoUrl ? (
                              <img
                                src={st.logoUrl}
                                alt={st.name}
                                className="w-11 h-11 rounded-xl object-cover bg-[#222] border border-white/10 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-[#222] border border-white/10 flex items-center justify-center text-xs font-black text-[#00FF66] font-mono flex-shrink-0">
                                CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono font-bold text-[#00FF66] bg-emerald-950/60 border border-emerald-800/40 px-1 rounded">
                                  CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                                </span>
                                <h3 className="text-sm font-bold text-white truncate">{st.name}</h3>
                                {st.mode === 'live-first' && (
                                  <span className="text-[9px] bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded font-black">LIVE</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{st.tagline}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handlePairStation(st.slug)}
                            disabled={isTuningThis}
                            className="py-2.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs whitespace-nowrap transition-colors shadow-sm flex-shrink-0 active:scale-95"
                          >
                            {isTuningThis ? 'TUNING...' : isCur ? '✓ PLAYING' : 'TUNE TV'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                  TAB 3: Live Creator Search & Instant Cast
                  ---------------------------------------------------- */}
              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-black text-white">Search Any YouTube Channel</h2>
                    <p className="text-xs text-gray-400">Search any creator or channel handle to broadcast on TV.</p>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search e.g. BBC, MrBeast, Veritasium, @mkbhd..."
                      className="w-full bg-[#181818] border border-white/10 focus:border-red-600 focus:outline-none rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder:text-gray-500 shadow-inner"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-500 text-base">🔍</span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300 text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] font-bold text-gray-500 uppercase flex-shrink-0">Popular:</span>
                    {quickSearchTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] text-gray-300 font-medium whitespace-nowrap transition-colors border border-white/5"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Search Results List */}
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {isSearching ? (
                      <div className="py-8 text-center text-gray-500 text-xs">
                        Searching YouTube channels...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 text-xs">
                        No channels found. Try typing a channel name or handle like <span className="text-red-400 font-mono">@mkbhd</span>.
                      </div>
                    ) : (
                      searchResults.map((item) => {
                        const isTuningThis = tuningSlug === item.handle;
                        return (
                          <div
                            key={item.channelId || item.handle}
                            className="bg-[#181818] border border-white/10 hover:border-red-600/50 rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {item.avatarUrl ? (
                                <img
                                  src={item.avatarUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-xl object-cover bg-[#222] border border-white/10 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                                  {item.title.slice(0, 2).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                                  {item.subscriberCount && (
                                    <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                                      {item.subscriberCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-red-400 font-mono">{item.handle}</p>
                                <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.description}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddSearchResult(item)}
                              disabled={isTuningThis}
                              className="py-2.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs whitespace-nowrap transition-colors shadow-md shadow-red-600/20 flex-shrink-0 active:scale-95"
                            >
                              {isTuningThis ? 'TUNING...' : '▶ CAST TO TV'}
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

      {/* Companion Footer */}
      <footer className="relative z-10 text-center text-xs text-gray-600 py-3">
        CreatorTV Companion • Pair with any Smart TV
      </footer>

    </main>
  );
}
