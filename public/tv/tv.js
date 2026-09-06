/**
 * CreatorTV Phase 2 - Vanilla Smart-TV Browser Client
 * Optimized for Hisense VIDAA TV, Samsung Tizen, LG webOS & constrained TV browsers
 */

(function () {
  'use strict';

  var TVKeys = {
    LEFT: ['ArrowLeft', 'Left', 37],
    RIGHT: ['ArrowRight', 'Right', 39],
    UP: ['ArrowUp', 'Up', 38],
    DOWN: ['ArrowDown', 'Down', 40],
    ENTER: ['Enter', 'Select', 'Ok', 13],
    BACK: ['Escape', 'Esc', 'Back', 'BrowserBack', 'U-Turn', 27, 461, 10009, 8],
    MENU: ['Menu', 'Guide', 'Info', 'ContextMenu', 18, 93, 457, 458],
    CH_UP: ['ChannelUp', 'PageUp', 33, 427, 516],
    CH_DOWN: ['ChannelDown', 'PageDown', 34, 428, 517],
    MEDIA_PLAY: ['MediaPlay', 'Play', 415, 179],
    MEDIA_PAUSE: ['MediaPause', 'Pause', 19, 179],
    MEDIA_PLAY_PAUSE: ['MediaPlayPause', 179],
  };

  function matchesKey(event, keyGroup) {
    var key = event.key;
    var code = event.keyCode;
    for (var i = 0; i < keyGroup.length; i++) {
      var target = keyGroup[i];
      if (typeof target === 'string' && key === target) return true;
      if (typeof target === 'number' && code === target) return true;
    }
    return false;
  }

  var state = {
    deviceId: null,
    deviceSecret: null,
    pairCode: null,
    pairCodeExpiresAt: null,
    paired: false,
    currentStationSlug: 'arise',
    station: null,
    stationData: null,
    allStations: [],
    currentView: 'pairing',
    isGuideOpen: false,
    pollTimer: null,
    stationRefreshTimer: null,
    hudTimer: null,
    isOnline: navigator.onLine !== false,
    debugMode: false,
    currentVideoIndex: 0,
    autoPlayTimer: null,
    ytPlayer: null,
    ytPlayerState: 'unloaded',
    lastPlayerError: null,
    lastCommandId: null,
    logs: [],
  };

  function logEvent(tag, details) {
    var entry = '[' + new Date().toLocaleTimeString() + '] ' + tag + (details ? ': ' + JSON.stringify(details) : '');
    console.log('[CreatorTV]', entry);
    state.logs.unshift(entry);
    if (state.logs.length > 25) state.logs.pop();
    updateDebugUI();
  }

  var FocusManager = {
    current: null,

    init: function () {
      document.addEventListener('keydown', FocusManager.handleKey);
    },

    getFocusableElements: function () {
      var container = state.isGuideOpen 
        ? document.getElementById('tv-guide-drawer') 
        : document.querySelector('.tv-view.active');
      
      if (!container) return [];
      var nodes = container.querySelectorAll('[data-focusable="true"]');
      var visible = [];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.offsetParent !== null && !el.disabled) {
          visible.push(el);
        }
      }
      return visible;
    },

    setFocus: function (el) {
      if (FocusManager.current && FocusManager.current !== el) {
        FocusManager.current.classList.remove('is-focused');
        FocusManager.current.blur();
      }
      if (el) {
        FocusManager.current = el;
        el.classList.add('is-focused');
        el.focus();
        if (typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        logEvent('FOCUS_SET', el.id || el.getAttribute('data-station') || el.tagName);
      }
      updateDebugUI();
    },

    restoreInitialFocus: function () {
      var elements = FocusManager.getFocusableElements();
      if (elements.length > 0) {
        FocusManager.setFocus(elements[0]);
      } else {
        FocusManager.current = null;
      }
    },

    handleKey: function (e) {
      logEvent('KEY_DOWN', { key: e.key, keyCode: e.keyCode });
      var activeKey = e.key || ('code:' + e.keyCode);
      var dbgKey = document.getElementById('dbg-last-key');
      if (dbgKey) dbgKey.textContent = activeKey;

      // Handle Direct Number Tuning (1-9)
      if (e.keyCode >= 49 && e.keyCode <= 57) {
        var chNum = e.keyCode - 48;
        tuneByChannelNumber(chNum);
        return;
      }

      // Handle Menu / TV Guide Toggle
      if (matchesKey(e, TVKeys.MENU)) {
        e.preventDefault();
        toggleTVGuide();
        return;
      }

      // If on Station view and user presses UP on remote, open Guide Drawer
      if (state.currentView === 'station' && !state.isGuideOpen && matchesKey(e, TVKeys.UP)) {
        e.preventDefault();
        toggleTVGuide(true);
        return;
      }

      // Channel Up / Down
      if (matchesKey(e, TVKeys.CH_UP)) {
        e.preventDefault();
        changeStationOffset(1);
        return;
      }
      if (matchesKey(e, TVKeys.CH_DOWN)) {
        e.preventDefault();
        changeStationOffset(-1);
        return;
      }

      // Media Keys
      if (matchesKey(e, TVKeys.MEDIA_PLAY) || matchesKey(e, TVKeys.MEDIA_PLAY_PAUSE)) {
        if (state.ytPlayer && typeof state.ytPlayer.playVideo === 'function') {
          state.ytPlayer.playVideo();
        }
        return;
      }
      if (matchesKey(e, TVKeys.MEDIA_PAUSE)) {
        if (state.ytPlayer && typeof state.ytPlayer.pauseVideo === 'function') {
          state.ytPlayer.pauseVideo();
        }
        return;
      }

      // Back / Return Key
      if (matchesKey(e, TVKeys.BACK)) {
        e.preventDefault();
        e.stopPropagation();
        if (state.isGuideOpen) {
          toggleTVGuide(false);
          return;
        }
        if (state.currentView === 'player') {
          closePlayer();
        }
        return;
      }

      // OK / Enter
      if (matchesKey(e, TVKeys.ENTER)) {
        if (FocusManager.current) {
          e.preventDefault();
          FocusManager.current.click();
        }
        return;
      }

      // Spatial D-Pad Navigation
      var elements = FocusManager.getFocusableElements();
      if (elements.length <= 1) return;

      var currentIndex = elements.indexOf(FocusManager.current);
      var nextIndex = currentIndex;

      // When guide is open, DOWN key closes it
      if (state.isGuideOpen && matchesKey(e, TVKeys.DOWN)) {
        e.preventDefault();
        toggleTVGuide(false);
        return;
      }

      if (matchesKey(e, TVKeys.RIGHT) || matchesKey(e, TVKeys.DOWN)) {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % elements.length;
        FocusManager.setFocus(elements[nextIndex]);
      } else if (matchesKey(e, TVKeys.LEFT) || matchesKey(e, TVKeys.UP)) {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + elements.length) % elements.length;
        FocusManager.setFocus(elements[nextIndex]);
      }
    },
  };

  function verifyCompatibility() {
    try {
      if (typeof window.fetch !== 'function') {
        throw new Error('Fetch API is missing on this browser engine.');
      }
      if (!window.localStorage) {
        throw new Error('localStorage is not supported or accessible.');
      }
      return true;
    } catch (err) {
      showCompatError('Incompatible Smart-TV Browser', err.message);
      return false;
    }
  }

  function showCompatError(title, msg) {
    var banner = document.getElementById('compat-banner');
    document.getElementById('compat-title').textContent = title;
    document.getElementById('compat-message').textContent = msg;
    banner.style.display = 'flex';
  }

  function switchView(viewName) {
    state.currentView = viewName;
    var views = document.querySelectorAll('.tv-view');
    for (var i = 0; i < views.length; i++) {
      views[i].classList.remove('active');
    }
    var target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.add('active');
    }
    setTimeout(function () {
      FocusManager.restoreInitialFocus();
    }, 50);
    logEvent('VIEW_SWITCH', viewName);
  }

  function fetchStationCatalog() {
    fetch('/api/stations')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.stations) {
          state.allStations = data.stations;
          renderTVGuideList();
        }
      })
      .catch(function (err) {
        logEvent('CATALOG_FETCH_ERROR', err.message);
      });
  }

  function initDevice() {
    logEvent('APP_START');
    fetchStationCatalog();
    startClock();
    renderPairingCode(null);

    var storedId = localStorage.getItem('creatorTvDeviceId');
    var storedSecret = localStorage.getItem('creatorTvDeviceSecret');

    if (storedId && storedSecret) {
      logEvent('DEVICE_RESTORE', storedId);
      state.deviceId = storedId;
      state.deviceSecret = storedSecret;
      pollStatus();
      startPolling();
    } else {
      registerNewDevice();
    }
  }

  function registerNewDevice() {
    logEvent('DEVICE_REGISTER_INIT');
    fetch('/api/devices/register', { method: 'POST' })
      .then(function (res) {
        if (!res.ok) throw new Error('Registration failed with status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        state.deviceId = data.deviceId;
        state.deviceSecret = data.deviceSecret;
        state.pairCode = data.pairCode;
        state.pairCodeExpiresAt = data.expiresAt;

        localStorage.setItem('creatorTvDeviceId', data.deviceId);
        localStorage.setItem('creatorTvDeviceSecret', data.deviceSecret);

        renderPairingCode(data.pairCode);
        logEvent('PAIR_CODE_CREATED', data.pairCode);

        startPolling();
      })
      .catch(function (err) {
        logEvent('DEVICE_REGISTER_ERROR', err.message);
        document.getElementById('pairing-status-text').textContent = 'Connecting to server (retry in 2s)...';
        setTimeout(registerNewDevice, 2000);
      });
  }

  function renderPairingCode(code) {
    var codeEl = document.getElementById('pairing-code');
    if (codeEl) codeEl.textContent = code || '------';
    
    var origin = window.location.origin;
    var urlEl = document.getElementById('connect-url-display');
    if (urlEl) urlEl.textContent = origin + '/connect';

    var statusEl = document.getElementById('pairing-status-text');
    if (code && statusEl) {
      statusEl.textContent = 'Waiting for phone connection...';
    }

    // Render QR Code
    if (window.TVQRCode && code) {
      var pairUrl = origin + '/connect?code=' + encodeURIComponent(code);
      window.TVQRCode.render('tv-qr-mount', pairUrl, 200);
    }
  }

  function startPolling() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = setInterval(pollStatus, 3000);
  }

  function pollStatus() {
    if (!state.deviceId || !state.deviceSecret) return;
    if (!state.isOnline) return;

    fetch('/api/devices/status', {
      headers: {
        'x-creatortv-device-id': state.deviceId,
        'x-creatortv-device-secret': state.deviceSecret,
      },
    })
      .then(function (res) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          logEvent('DEVICE_INVALIDATED');
          localStorage.removeItem('creatorTvDeviceId');
          localStorage.removeItem('creatorTvDeviceSecret');
          registerNewDevice();
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;

        // Execute any incoming companion remote command
        if (data.command && data.command.id !== state.lastCommandId) {
          state.lastCommandId = data.command.id;
          executeRemoteCommand(data.command);
        }

        if (data.paired) {
          var newSlug = (data.station && data.station.slug) ? data.station.slug : 'arise';
          if (!state.paired || state.currentStationSlug !== newSlug) {
            state.paired = true;
            state.currentStationSlug = newSlug;
            state.station = data.station;
            logEvent('DEVICE_PAIRED_OR_TUNED', newSlug);
            transitionToStation(newSlug);
          }
        } else {
          if (data.pairCode && data.pairCode !== state.pairCode) {
            state.pairCode = data.pairCode;
            state.pairCodeExpiresAt = data.expiresAt;
            renderPairingCode(data.pairCode);
            logEvent('PAIR_CODE_UPDATED', data.pairCode);
          }
        }
        updateDebugUI();
      })
      .catch(function (err) {
        logEvent('STATUS_POLL_ERROR', err.message);
      });
  }

  function executeRemoteCommand(cmd) {
    logEvent('REMOTE_COMMAND_RECEIVED', cmd);
    var dbgCmd = document.getElementById('dbg-last-cmd');
    if (dbgCmd) dbgCmd.textContent = cmd.action;

    switch (cmd.action) {
      case 'TUNE_STATION':
        if (cmd.payload && cmd.payload.station) {
          tuneToStation(cmd.payload.station);
        }
        break;
      case 'PLAY':
        if (state.currentView !== 'player') {
          startPlayback();
        } else if (state.ytPlayer && typeof state.ytPlayer.playVideo === 'function') {
          state.ytPlayer.playVideo();
        }
        break;
      case 'PAUSE':
        if (state.ytPlayer && typeof state.ytPlayer.pauseVideo === 'function') {
          state.ytPlayer.pauseVideo();
        }
        break;
      case 'MUTE':
        if (state.ytPlayer && typeof state.ytPlayer.mute === 'function') {
          state.ytPlayer.mute();
        }
        break;
      case 'UNMUTE':
        if (state.ytPlayer && typeof state.ytPlayer.unMute === 'function') {
          state.ytPlayer.unMute();
        }
        break;
      case 'NEXT_VIDEO':
        closePlayer();
        startPlayback();
        break;
      default:
        break;
    }
  }

  function transitionToStation(slug) {
    slug = slug || state.currentStationSlug || 'arise';
    switchView('station');
    
    if (state.autoPlayTimer) clearTimeout(state.autoPlayTimer);

    loadStationData(slug, function () {
      // Auto-start playback on tune after 1.5s preview
      state.autoPlayTimer = setTimeout(function () {
        if (state.currentView === 'station' && !state.isGuideOpen) {
          startPlayback();
        }
      }, 1500);
    });

    if (state.stationRefreshTimer) clearInterval(state.stationRefreshTimer);
    state.stationRefreshTimer = setInterval(function () {
      loadStationData(state.currentStationSlug);
    }, 60000);
  }

  function loadStationData(slug, callback) {
    slug = slug || state.currentStationSlug || 'arise';
    logEvent('STATION_LOAD', slug);

    fetch('/api/stations/' + encodeURIComponent(slug))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.stationData = data;
        renderStationUI(data);
        showNowPlayingHUD();
        if (typeof callback === 'function') callback(data);
      })
      .catch(function (err) {
        logEvent('STATION_LOAD_ERROR', err.message);
      });
  }

  function renderStationUI(data) {
    var stationInfo = data.station || {};
    var backdropEl = document.getElementById('station-backdrop-bg');
    var badgeEl = document.getElementById('station-badge');
    var chNumEl = document.getElementById('station-channel-num');
    var logoImgEl = document.getElementById('station-logo-img');
    var logoEl = document.getElementById('station-logo-text');
    var sublogoEl = document.getElementById('station-sublogo-text');
    var genreEl = document.getElementById('station-genre-tag');
    var modeTagEl = document.getElementById('station-mode-tag');
    var titleEl = document.getElementById('station-program-title');
    var descEl = document.getElementById('station-program-desc');
    var watchBtn = document.getElementById('btn-watch');

    var chFormatted = 'CH ' + (stationInfo.channelNumber ? (stationInfo.channelNumber < 10 ? '0' + stationInfo.channelNumber : stationInfo.channelNumber) : '01');
    if (chNumEl) chNumEl.textContent = chFormatted;

    // Set Dynamic High-Res Backdrop
    var bgUrl = stationInfo.backdropUrl || stationInfo.logoUrl || '';
    if (backdropEl) {
      if (bgUrl) {
        backdropEl.style.backgroundImage = 'url("' + bgUrl + '")';
      } else {
        backdropEl.style.backgroundImage = 'none';
      }
    }

    // Set Station Logo
    if (logoImgEl) {
      var logoSrc = stationInfo.logoUrl || stationInfo.backdropUrl || '';
      if (logoSrc) {
        logoImgEl.src = logoSrc;
        logoImgEl.style.display = 'block';
      } else {
        logoImgEl.style.display = 'none';
      }
    }

    // Split name for station header styling
    var nameParts = (stationInfo.name || 'CREATOR TV').split(' ');
    if (logoEl) logoEl.textContent = nameParts[0] || 'CREATOR';
    if (sublogoEl) sublogoEl.textContent = nameParts.slice(1).join(' ') || 'TV';

    // Only genre/category in the pill (do not append huge description)
    if (genreEl) genreEl.textContent = (stationInfo.category ? stationInfo.category.toUpperCase() : 'BROADCAST');
    if (modeTagEl) modeTagEl.textContent = (data.live || stationInfo.mode === 'live-first') ? '24/7 LIVE STREAM' : 'CONTINUOUS BROADCAST';

    var topVideo = data.fallback && data.fallback.length > 0 ? data.fallback[state.currentVideoIndex || 0] : null;

    if (data.live && data.current) {
      logEvent('YOUTUBE_LIVE_FOUND', data.current.videoId);
      badgeEl.className = 'badge-live';
      badgeEl.innerHTML = '<span class="live-dot"></span> LIVE';
      titleEl.textContent = data.current.title || (stationInfo.name + ' LIVE');
      descEl.textContent = stationInfo.tagline || 'Active 24-hour live broadcast.';
      watchBtn.textContent = '▶ WATCH LIVE';
    } else {
      logEvent('YOUTUBE_LIVE_NOT_FOUND', 'continuous playback mode');
      badgeEl.className = 'badge-live badge-offline';
      badgeEl.textContent = 'CONTINUOUS PLAY';

      if (topVideo) {
        titleEl.textContent = topVideo.title || stationInfo.name;
        descEl.textContent = stationInfo.tagline || 'Continuous broadcast programming.';
        watchBtn.textContent = '▶ WATCH NOW';
      } else {
        titleEl.textContent = stationInfo.name;
        descEl.textContent = stationInfo.tagline || '24-hour programming.';
        watchBtn.textContent = '▶ WATCH NOW';
      }
    }
  }

  function showNowPlayingHUD() {
    var hud = document.getElementById('now-playing-hud');
    if (!hud) return;

    var stationInfo = (state.stationData && state.stationData.station) ? state.stationData.station : {};
    var chFormatted = 'CH ' + (stationInfo.channelNumber ? (stationInfo.channelNumber < 10 ? '0' + stationInfo.channelNumber : stationInfo.channelNumber) : '01');

    var currentVideo = (state.stationData && state.stationData.current) 
      ? state.stationData.current 
      : (state.stationData && state.stationData.fallback && state.stationData.fallback.length > 0 ? state.stationData.fallback[state.currentVideoIndex || 0] : null);

    document.getElementById('hud-channel-num').textContent = chFormatted;
    document.getElementById('hud-station-title').textContent = stationInfo.name || 'CreatorTV';
    document.getElementById('hud-program-title').textContent = currentVideo ? currentVideo.title : (stationInfo.tagline || 'Broadcast Stream');
    document.getElementById('hud-live-tag').textContent = (state.stationData && state.stationData.live) ? '● LIVE' : '● 24/7 TV';

    hud.classList.add('visible');
    if (state.hudTimer) clearTimeout(state.hudTimer);
    state.hudTimer = setTimeout(function () {
      hud.classList.remove('visible');
    }, 4000);
  }

  function renderTVGuideList() {
    var list = document.getElementById('guide-channel-list');
    if (!list) return;

    list.innerHTML = state.allStations.map(function (st) {
      var isCur = (st.slug === state.currentStationSlug);
      var chStr = 'CH ' + (st.channelNumber < 10 ? '0' + st.channelNumber : st.channelNumber);
      var bgImg = st.backdropUrl || st.logoUrl || '';
      return '<div class="guide-channel-card ' + (isCur ? 'active-station' : '') + '" data-focusable="true" data-station="' + st.slug + '" tabindex="0">' +
        '<div class="guide-card-preview" style="' + (bgImg ? 'background-image: url(' + bgImg + ');' : '') + '">' +
          '<div class="guide-card-preview-overlay">' +
            '<span class="guide-card-ch">' + chStr + '</span>' +
            '<span class="guide-card-cat">' + (st.category || 'CHANNEL') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="guide-card-body">' +
          '<div class="guide-card-name">' + st.name + '</div>' +
          '<div class="guide-card-tagline">' + (st.tagline || '') + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Bind card click & keydown for seamless channel switching
    var cards = list.querySelectorAll('.guide-channel-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var slug = this.getAttribute('data-station');
        tuneToStation(slug);
        toggleTVGuide(false);
      });
      cards[i].addEventListener('keydown', function (e) {
        if (e.keyCode === 13 || e.key === 'Enter') {
          e.preventDefault();
          var slug = this.getAttribute('data-station');
          tuneToStation(slug);
          toggleTVGuide(false);
        }
      });
    }
  }

  function toggleTVGuide(force) {
    var drawer = document.getElementById('tv-guide-drawer');
    if (!drawer) return;

    state.isGuideOpen = (typeof force === 'boolean') ? force : !state.isGuideOpen;
    if (state.isGuideOpen) {
      drawer.classList.add('open');
      renderTVGuideList();
      setTimeout(function () {
        var activeCard = drawer.querySelector('.guide-channel-card.active-station') || drawer.querySelector('.guide-channel-card');
        if (activeCard) {
          FocusManager.setFocus(activeCard);
        } else {
          FocusManager.restoreInitialFocus();
        }
      }, 60);
    } else {
      drawer.classList.remove('open');
      setTimeout(function () {
        FocusManager.restoreInitialFocus();
      }, 60);
    }
  }

  function tuneToStation(slug) {
    if (!slug) return;
    state.currentStationSlug = slug;
    state.currentVideoIndex = 0;
    logEvent('TUNE_STATION', slug);

    if (state.currentView === 'player') {
      loadStationData(slug, function () {
        startPlayback();
      });
    } else {
      transitionToStation(slug);
    }
  }

  function tuneByChannelNumber(num) {
    for (var i = 0; i < state.allStations.length; i++) {
      if (state.allStations[i].channelNumber === num) {
        tuneToStation(state.allStations[i].slug);
        return;
      }
    }
  }

  function changeStationOffset(dir) {
    if (state.allStations.length === 0) return;
    var curIdx = 0;
    for (var i = 0; i < state.allStations.length; i++) {
      if (state.allStations[i].slug === state.currentStationSlug) {
        curIdx = i;
        break;
      }
    }
    var nextIdx = (curIdx + dir + state.allStations.length) % state.allStations.length;
    tuneToStation(state.allStations[nextIdx].slug);
  }

  var ytApiLoaded = false;
  function loadYouTubeIframeApi(callback) {
    if (window.YT && window.YT.Player) {
      callback();
      return;
    }
    if (!ytApiLoaded) {
      ytApiLoaded = true;
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = function () {
      logEvent('YT_API_READY');
      callback();
    };
  }

  function startPlayback(customVideoId) {
    var videoId = customVideoId || null;
    if (!videoId && state.stationData) {
      if (state.stationData.live && state.stationData.current) {
        videoId = state.stationData.current.videoId;
      } else if (state.stationData.fallback && state.stationData.fallback.length > 0) {
        var idx = state.currentVideoIndex || 0;
        if (idx >= state.stationData.fallback.length) idx = 0;
        videoId = state.stationData.fallback[idx].videoId;
      }
    }

    if (!videoId) {
      videoId = 'UCrkXEGnljz2r0U_yH6_p6rQ';
    }

    switchView('player');
    document.getElementById('player-loading-overlay').style.display = 'flex';
    document.getElementById('player-error-overlay').style.display = 'none';
    showNowPlayingHUD();

    logEvent('PLAYER_INIT', videoId);

    loadYouTubeIframeApi(function () {
      initPlayer(videoId);
    });
  }

  function playNextVideoInQueue() {
    var queue = [];
    if (state.stationData && state.stationData.fallback && state.stationData.fallback.length > 0) {
      queue = state.stationData.fallback;
    }

    if (queue.length > 1) {
      state.currentVideoIndex = (state.currentVideoIndex + 1) % queue.length;
      var nextVid = queue[state.currentVideoIndex];
      logEvent('PLAYLIST_AUTO_ADVANCE', { index: state.currentVideoIndex, videoId: nextVid.videoId, title: nextVid.title });
      
      showNowPlayingHUD();
      if (state.ytPlayer && typeof state.ytPlayer.loadVideoById === 'function') {
        state.ytPlayer.loadVideoById(nextVid.videoId);
      } else {
        initPlayer(nextVid.videoId);
      }
    } else {
      // If single video or live channel, refresh and replay
      loadStationData(state.currentStationSlug, function () {
        startPlayback();
      });
    }
  }

  function initPlayer(videoId) {
    if (state.ytPlayer) {
      try {
        state.ytPlayer.destroy();
      } catch (e) {}
    }

    var mount = document.getElementById('yt-player-mount');
    mount.innerHTML = '<div id="yt-player-target"></div>';

    state.ytPlayer = new window.YT.Player('yt-player-target', {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        enablejsapi: 1,
        origin: window.location.origin,
        modestbranding: 1,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  }

  function onPlayerReady(event) {
    logEvent('PLAYER_READY');
    state.ytPlayerState = 'ready';
    try {
      event.target.playVideo();
      logEvent('PLAYER_PLAY_INVOKED');
    } catch (e) {
      logEvent('PLAY_INVOCATION_FAILED', e.message);
    }
    updateDebugUI();
  }

  function onPlayerStateChange(event) {
    var stateMap = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'cued',
    };
    var current = stateMap[event.data] || event.data;
    state.ytPlayerState = current;
    logEvent('PLAYER_STATE', current);

    if (current === 'playing') {
      document.getElementById('player-loading-overlay').style.display = 'none';
    }

    // Auto-advance to next video when current ends (Continuous Broadcast TV)
    if (current === 'ended' || event.data === 0) {
      logEvent('VIDEO_ENDED_AUTO_ADVANCE');
      setTimeout(playNextVideoInQueue, 800);
    }

    updateDebugUI();
  }

  function onPlayerError(event) {
    var errCode = event.data;
    state.lastPlayerError = errCode;
    logEvent('PLAYER_ERROR', {
      errorCode: errCode,
      origin: window.location.origin,
      station: state.currentStationSlug,
    });

    document.getElementById('player-loading-overlay').style.display = 'none';
    var errOverlay = document.getElementById('player-error-overlay');
    errOverlay.style.display = 'flex';

    var msg = 'CreatorTV could not play this stream on this television.';
    if (errCode === 153 || errCode === 150 || errCode === 101) {
      msg = 'YouTube playback is restricted on smart-TV embed origins (Error ' + errCode + ').';
    }
    document.getElementById('player-error-message').textContent = msg;
    document.getElementById('player-error-code').textContent = 'Error Code: ' + errCode;

    FocusManager.restoreInitialFocus();
    updateDebugUI();
  }

  function closePlayer() {
    logEvent('PLAYER_CLOSE');
    if (state.ytPlayer) {
      try {
        state.ytPlayer.stopVideo();
        state.ytPlayer.destroy();
      } catch (e) {}
      state.ytPlayer = null;
    }
    document.getElementById('yt-player-mount').innerHTML = '';
    switchView('station');
  }

  function startClock() {
    var updateClock = function () {
      var clockEl = document.getElementById('station-clock');
      if (clockEl) {
        var now = new Date();
        var hours = now.getHours();
        var mins = now.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        var minsStr = mins < 10 ? '0' + mins : mins;
        clockEl.textContent = hours + ':' + minsStr + ' ' + ampm;
      }
    };
    updateClock();
    setInterval(updateClock, 10000);
  }

  window.addEventListener('online', function () {
    state.isOnline = true;
    document.getElementById('offline-banner').style.display = 'none';
    logEvent('NETWORK_ONLINE');
    pollStatus();
  });

  window.addEventListener('offline', function () {
    state.isOnline = false;
    document.getElementById('offline-banner').style.display = 'flex';
    logEvent('NETWORK_OFFLINE');
  });

  function initDebugMode() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1') {
      state.debugMode = true;
      document.getElementById('debug-hud').style.display = 'block';
    }

    var resetBtn = document.getElementById('btn-debug-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Reset this TV and generate a fresh pairing identity?')) {
          localStorage.clear();
          window.location.href = '/tv?debug=1';
        }
      });
    }
  }

  function updateDebugUI() {
    if (!state.debugMode) return;

    var setTxt = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val || '--';
    };

    setTxt('dbg-viewport', window.innerWidth + 'x' + window.innerHeight);
    setTxt('dbg-screen', window.screen.width + 'x' + window.screen.height);
    setTxt('dbg-online', state.isOnline ? 'YES' : 'NO');
    setTxt('dbg-device-id', state.deviceId ? state.deviceId.slice(0, 8) + '...' : 'none');
    setTxt('dbg-pair-code', state.pairCode);
    setTxt('dbg-pair-exp', state.pairCodeExpiresAt ? new Date(state.pairCodeExpiresAt).toLocaleTimeString() : '--');
    setTxt('dbg-paired', state.paired ? 'TRUE' : 'FALSE');
    setTxt('dbg-station', state.currentStationSlug);
    setTxt('dbg-channel', state.stationData ? state.stationData.channelId : '--');
    setTxt('dbg-live', state.stationData ? (state.stationData.live ? 'LIVE' : 'OFFLINE') : '--');
    setTxt('dbg-video-id', state.stationData && state.stationData.current ? state.stationData.current.videoId : (state.stationData && state.stationData.fallback[0] ? state.stationData.fallback[0].videoId : '--'));
    setTxt('dbg-player-state', state.ytPlayerState + (state.lastPlayerError ? ' (Err: ' + state.lastPlayerError + ')' : ''));
    setTxt('dbg-focus', FocusManager.current ? (FocusManager.current.id || FocusManager.current.getAttribute('data-station') || FocusManager.current.tagName) : 'none');

    var logsEl = document.getElementById('dbg-logs');
    if (logsEl) {
      logsEl.innerHTML = state.logs.map(function (l) { return '<div>' + l + '</div>'; }).join('');
    }
  }

  function bindUIEvents() {
    var watchBtn = document.getElementById('btn-watch');
    if (watchBtn) watchBtn.addEventListener('click', startPlayback);

    var guideBtn = document.getElementById('btn-open-guide');
    if (guideBtn) guideBtn.addEventListener('click', function () { toggleTVGuide(true); });

    var closeGuideBtn = document.getElementById('btn-close-guide');
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', function () { toggleTVGuide(false); });

    // Hover trigger bar at screen bottom
    var hoverTrigger = document.getElementById('guide-hover-trigger');
    if (hoverTrigger) {
      hoverTrigger.addEventListener('mouseenter', function () { toggleTVGuide(true); });
      hoverTrigger.addEventListener('click', function () { toggleTVGuide(true); });
    }

    // Auto-close drawer on mouse leave
    var drawer = document.getElementById('tv-guide-drawer');
    if (drawer) {
      drawer.addEventListener('mouseleave', function () {
        toggleTVGuide(false);
      });
    }

    // Screen-edge mouse detection
    window.addEventListener('mousemove', function (e) {
      if (state.currentView === 'station' && !state.isGuideOpen) {
        if (e.clientY >= (window.innerHeight - 35)) {
          toggleTVGuide(true);
        }
      }
    });

    var retryBtn = document.getElementById('btn-player-retry');
    if (retryBtn) retryBtn.addEventListener('click', startPlayback);

    var playerGuideBtn = document.getElementById('btn-player-guide');
    if (playerGuideBtn) playerGuideBtn.addEventListener('click', function () {
      closePlayer();
      toggleTVGuide(true);
    });

    var backBtn = document.getElementById('btn-player-back');
    if (backBtn) backBtn.addEventListener('click', closePlayer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!verifyCompatibility()) return;

    FocusManager.init();
    initDebugMode();
    bindUIEvents();
    initDevice();

    setTimeout(function () {
      FocusManager.restoreInitialFocus();
    }, 100);
  });
})();
