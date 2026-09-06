# CreatorTV

CreatorTV turns internet creators and broadcasters into television-style stations for constrained smart-TV browsers (specifically tested on Hisense VIDAA).

---

## 1. Local Development Quickstart

\`\`\`bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
\`\`\`

Access points:
- Landing Page: \`http://localhost:3000\`
- TV Interface: \`http://localhost:3000/tv\`
- TV Interface with Debug HUD: \`http://localhost:3000/tv?debug=1\`
- Phone/Web Companion: \`http://localhost:3000/connect\`

---

## 2. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab.
3. Run the migration script in \`supabase/migrations/20260905_init_devices.sql\`.
4. Copy credentials from **Project Settings > API**:
   - \`SUPABASE_URL\`
   - \`SUPABASE_ANON_KEY\`
   - \`SUPABASE_SERVICE_ROLE_KEY\` (keep server-side only)

---

## 3. YouTube API Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **YouTube Data API v3**.
3. Create an API Key in **Credentials**.
4. Set \`YOUTUBE_API_KEY\` in your \`.env.local\` and Vercel dashboard.

---

## 4. Testing CreatorTV on Hisense VIDAA TV

### Option A: VIDAA Developer / Hosted App Test Mode
1. Ensure the TV is on the same local network or internet.
2. In the VIDAA Developer Test Portal / Launcher, add a hosted web application:
   - **App Name**: \`CreatorTV\`
   - **App URL**: \`https://YOUR_DOMAIN/tv\`
   - **Icon URL**: \`https://YOUR_DOMAIN/icons/creatortv-512.svg\`
   - **Resolution**: \`1920x1080\`
3. Launch the app and use the remote D-pad to test navigation.

### Option B: VIDAA Built-In Browser Fallback
1. Open the television's built-in web browser.
2. Navigate directly to \`https://YOUR_DOMAIN/tv\`.
3. Press Fullscreen on the browser bar.
4. Test pairing with your phone at \`https://YOUR_DOMAIN/connect\`.

---

## 5. Diagnostic Mode (\`/tv?debug=1\`) & YouTube Error 153

- Append \`?debug=1\` to inspect real-time remote keycodes, viewport size, player status, and device pairing logs.
- If YouTube throws **Error 153/150** due to smart-TV embed restrictions, CreatorTV logs origin details and displays an inline recovery menu without crashing.

---

## 6. Manual Test Checklist

- [x] TV client loads without React runtime dependencies (\`/tv\`)
- [x] Unique 6-character code generates and auto-refreshes every 15 mins
- [x] TV restores device secret from localStorage upon reload
- [x] Phone companion (\`/connect\`) validates codes and pairs ARISE News
- [x] TV detects pairing within 3 seconds and switches to station mode
- [x] ARISE live broadcast or fallback shows render cleanly
- [x] Spatial remote navigation (Arrow keys + OK + Back) works reliably
- [x] Fullscreen YouTube player initializes following user gesture
