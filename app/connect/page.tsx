'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

interface Station {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  channelNumber?: number;
  accentColor?: string;
  youtubeHandle: string;
  mode: string;
}

export default function ConnectPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-center text-gray-400">Loading companion...</div>}>
      <ConnectContent />
    </React.Suspense>
  );
}

function ConnectContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'code' | 'station' | 'remote'>('code');
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customHandle, setCustomHandle] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteMessage, setRemoteMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load available stations from backend API
  useEffect(() => {
    fetch('/api/stations')
      .then((res) => res.json())
      .then((data) => {
        if (data.stations) {
          setStations(data.stations);
        }
      })
      .catch((err) => console.error('Failed to load stations:', err));
  }, []);

  // Handle URL query code (e.g. from QR scan: /connect?code=ABC123)
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      const sanitized = urlCode.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6);
      setCode(sanitized);
    }
  }, [searchParams]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const val = e.target.value.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 6);
    setCode(val);
  };

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter all 6 characters of the code shown on your TV screen.');
      return;
    }
    setError(null);
    setStep('station');
  };

  const handlePairStation = async (stationSlug: string) => {
    setError(null);
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
          return;
        }

        const matched = stations.find((s) => s.slug === stationSlug) || {
          slug: stationSlug,
          name: data.station?.name || stationSlug,
          tagline: 'Connected Broadcast Station',
          category: 'news',
          youtubeHandle: '',
          mode: 'live-first',
        };

        setActiveStation(matched);
        setStep('remote');
      } catch (err) {
        setError('Network error connecting to CreatorTV server. Please try again.');
      }
    });
  };

  const handleCustomChannelPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHandle.trim()) return;

    setCustomLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stations/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: customHandle }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resolve custom channel.');
        setCustomLoading(false);
        return;
      }

      const customStation = data.station;
      // Pair TV with custom station
      await handlePairStation(customStation.slug);
    } catch (err) {
      setError('Failed to tune custom channel.');
    } finally {
      setCustomLoading(false);
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
          setRemoteMessage('Playback started on TV');
        } else if (action === 'PAUSE') {
          setIsPlaying(false);
          setRemoteMessage('TV Paused');
        } else if (action === 'MUTE') {
          setIsMuted(true);
          setRemoteMessage('TV Muted');
        } else if (action === 'UNMUTE') {
          setIsMuted(false);
          setRemoteMessage('TV Unmuted');
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

  const filteredStations = selectedCategory === 'all'
    ? stations
    : stations.filter((s) => s.category === selectedCategory);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#080808]">
      <div className="w-full max-w-lg bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#222]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-600/30">
              CTV
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">CreatorTV</h1>
              <p className="text-xs text-gray-400">TV Companion & Remote</p>
            </div>
          </div>

          {step === 'remote' && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TV PAIRED ({code})</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-sm leading-relaxed flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 font-bold ml-2">✕</button>
          </div>
        )}

        {remoteMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-sm text-center font-medium animate-fade-in">
            ✓ {remoteMessage}
          </div>
        )}

        {/* STEP 1: Code Input */}
        {step === 'code' && (
          <form onSubmit={handleValidateCode} className="space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">Connect your television</h2>
              <p className="text-sm text-gray-400">
                Enter the 6-character code shown on your TV screen (or scan the TV QR code).
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="A7K92P"
                maxLength={6}
                autoFocus
                className="w-full bg-[#1c1c1c] border-2 border-[#333] focus:border-red-600 focus:outline-none rounded-2xl py-4 text-center text-3xl font-mono font-bold tracking-widest text-white uppercase transition-colors"
              />
              <p className="text-xs text-gray-500 text-center">
                Letters & numbers only (0, O, 1, I excluded)
              </p>
            </div>

            <button
              type="submit"
              disabled={code.length !== 6 || isPending}
              className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-bold text-base transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              Continue
            </button>
          </form>
        )}

        {/* STEP 2: Station Selection & Lineup */}
        {step === 'station' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Select a Broadcast Station</h2>
                <p className="text-xs text-gray-400">Pairing Code: <span className="font-mono text-gray-200 font-bold">{code}</span></p>
              </div>
              <button
                type="button"
                onClick={() => setStep('code')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Change Code
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
              {['all', 'news', 'tech', 'science', 'music'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
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
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {filteredStations.map((st) => (
                <div
                  key={st.slug}
                  className="bg-[#181818] border border-[#2b2b2b] hover:border-red-600/60 rounded-xl p-4 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-xs font-black text-emerald-400 font-mono flex-shrink-0">
                      CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white truncate">{st.name}</h3>
                        {st.mode === 'live-first' && (
                          <span className="text-[10px] bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded font-semibold">LIVE</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{st.tagline}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePairStation(st.slug)}
                    disabled={isPending}
                    className="py-2 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap transition-colors shadow-sm flex-shrink-0"
                  >
                    ADD TO TV
                  </button>
                </div>
              ))}
            </div>

            {/* Custom YouTube Channel Box */}
            <form onSubmit={handleCustomChannelPair} className="pt-2 border-t border-[#222] space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">
                Or Broadcast Any YouTube Creator / Handle:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHandle}
                  onChange={(e) => setCustomHandle(e.target.value)}
                  placeholder="@mkbhd or YouTube URL"
                  className="flex-1 bg-[#1a1a1a] border border-[#333] focus:border-red-600 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={customLoading || !customHandle.trim()}
                  className="px-4 py-2 bg-[#282828] hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  {customLoading ? 'Tuning...' : 'TUNE TV'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Interactive Virtual TV Remote */}
        {step === 'remote' && (
          <div className="space-y-6">
            {/* Active Station Card */}
            <div className="bg-[#181818] border-2 border-red-600/50 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <div className="text-[11px] font-bold text-red-400 tracking-wider uppercase">Now Broadcasting on TV</div>
                <h3 className="text-lg font-black text-white truncate">{activeStation?.name || 'ARISE News'}</h3>
                <p className="text-xs text-gray-400 truncate">{activeStation?.tagline}</p>
              </div>
              <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider flex-shrink-0">
                CH {activeStation?.channelNumber || '01'}
              </div>
            </div>

            {/* Remote Control D-Pad & Action Buttons */}
            <div className="bg-[#161616] border border-[#262626] rounded-2xl p-5 space-y-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">TV Playback Controls</div>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => sendRemoteCommand(isPlaying ? 'PAUSE' : 'PLAY')}
                  className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-colors shadow-md ${
                    isPlaying ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                </button>

                <button
                  onClick={() => sendRemoteCommand(isMuted ? 'UNMUTE' : 'MUTE')}
                  className="py-3.5 px-4 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-200 font-bold text-sm transition-colors"
                >
                  {isMuted ? '🔊 UNMUTE' : '🔇 MUTE'}
                </button>

                <button
                  onClick={() => sendRemoteCommand('NEXT_VIDEO')}
                  className="py-3.5 px-4 rounded-xl bg-[#252525] hover:bg-[#333] text-gray-200 font-bold text-sm transition-colors"
                >
                  ⏭ NEXT
                </button>
              </div>
            </div>

            {/* Station Switcher Grid */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Channel Switcher</div>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {stations.map((st) => (
                  <button
                    key={st.slug}
                    onClick={() => sendRemoteCommand('TUNE_STATION', { station: st.slug })}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                      activeStation?.slug === st.slug
                        ? 'bg-red-600/20 border-red-600 text-white'
                        : 'bg-[#181818] border-[#292929] hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        CH {st.channelNumber ? (st.channelNumber < 10 ? `0${st.channelNumber}` : st.channelNumber) : '01'}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-gray-400">{st.category}</span>
                    </div>
                    <span className="text-xs font-bold truncate">{st.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Disconnect & Reset */}
            <div className="pt-2 border-t border-[#222] flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setStep('station')}
                className="text-gray-400 hover:text-white"
              >
                + Browse Station Guide
              </button>
              <button
                type="button"
                onClick={() => {
                  setCode('');
                  setActiveStation(null);
                  setStep('code');
                }}
                className="text-red-400 hover:text-red-300"
              >
                Disconnect TV
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
