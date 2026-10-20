# 📺 Tivicify — Universal Cross-Platform TV & Movie Streaming App

**Tivicify** is a modern, unified streaming application engineered to run across **Smart TVs, Mobile phones, Tablets, and Laptops/Desktops** using legal free assets, public domain cinema, open-source animations, and live IPTV broadcasts.

---

## 🚀 Quick Start

### 1. Web & Desktop / Laptop Browser
Run the development server or preview the optimized production build:

```bash
# Start Vite development server
npm run dev

# Or test the production build
npm run preview
```

Or via **XAMPP Apache**: Open `http://localhost/tivicify/` in your browser.

---

## 📱 Android & Android TV APK File

The ready-to-install Android APK has been compiled and is available directly in the project directory:

- **Direct APK Location**: [`Tivicify.apk`](file:///c:/xampp/htdocs/tivicify/Tivicify.apk) (`4.46 MB`)
- **Web Download Location**: `http://localhost/tivicify/dist/Tivicify.apk`
- **Source Build Path**: `android/app/build/outputs/apk/debug/app-debug.apk`

### How to Install the APK on Your Devices:
1. **Android Phone or Tablet**:
   - Transfer `Tivicify.apk` via USB, Google Drive, WhatsApp, or download it from `http://<your-computer-ip>/tivicify/dist/Tivicify.apk`.
   - Tap the APK file and select **Install** (allow "Install from unknown sources" if prompted).
2. **Android TV / Google TV / Fire TV Stick**:
   - **Method A (ADB)**: Run `adb install Tivicify.apk` from your computer while connected over Wi-Fi.
   - **Method B (USB Drive)**: Copy `Tivicify.apk` to a USB flash drive, plug it into the Smart TV, and open it with a file manager (like FX File Explorer).
   - **Method C (Downloader App)**: Enter your computer's local IP URL (`http://<IP>/tivicify/dist/Tivicify.apk`) into the **Downloader** app on Fire TV/Android TV.

---

## 🌟 Key Features

### 1. 🎬 Curated Free & Legal Masterpieces
- **Blender 4K Open Source Movies**: *Tears of Steel*, *Big Buck Bunny*, *Sintel*, *Cosmos Laundromat*, *Charge*, *Elephants Dream*.
- **Restored Public Domain Feature Films**: *Night of the Living Dead* (1968), *Metropolis* (1927), *His Girl Friday* (1940), *Charade* (1963), *Plan 9 from Outer Space* (1959), *Carnival of Souls* (1962), *Nosferatu* (1922).
- **Golden Age Animation**: Classic 1930s *Popeye the Sailor*, *Fleischer Superman* (1941), *Betty Boop*.
- **Documentaries & Science**: NASA Lunar Reconnaissance 4K, Earth Orbit from ISS.

### 2. 📡 24/7 Legal Live TV (HLS IPTV)
- **Official Live Channels**: NASA TV HD, DW News (Deutsche Welle), France 24 English, Euronews, Red Bull TV Action Sports, Retro Cinema 24/7, Blender Showcase TV, Serenity Ambient Cam.
- **Electronic Program Guide (EPG)** with categorized channel browsing.

### 3. 🌐 TMDB Metadata API Integration
- Browse and search trending and top-rated movies across global cinema.
- Add your free TMDB API key under **Settings** to unlock dynamic posters, backdrops, ratings, and trailers.

### 4. 🗂️ Custom Stream & IPTV Hub
- **Add Custom URL**: Paste any direct video URL (`.mp4`, `.webm`, `.m3u8` HLS live streams).
- **Import M3U Playlists**: Drag & drop or paste any IPTV M3U/M3U8 playlist to instantly import hundreds of live channels.

### 5. 🎮 10-Foot Smart TV Remote Navigation
- Full spatial navigation using **D-Pad arrow keys** (`Up`, `Down`, `Left`, `Right`, `Enter`, `Back`).
- Visual neon focus ring and smooth automatic viewport centering.
- Built-in **On-Screen TV Remote Simulator** to test 10-foot remote control navigation directly on your laptop or tablet!

### 6. 📽️ Advanced Video Player
- Powered by `hls.js` + HTML5 video with adaptive bitrate streaming.
- Auto-hiding cinema overlay with scrub bar and buffer indicator.
- Speed control (`0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`).
- Aspect ratio switcher (`Fit`, `Cover/Fill`, `16:9`).
- Picture-in-Picture (PiP) and Fullscreen toggle.
- Automatically saves timestamps into **Continue Watching**.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Streaming Engine**: `hls.js` (HTTP Live Streaming) + HTML5 Video API.
- **Mobile & TV Bridge**: Capacitor 7 (`@capacitor/core`, `@capacitor/android`).
- **Android Target**: Android 14 / API 35 with Android TV Leanback launcher support.

---

## 🔄 Rebuilding the APK in the Future
To update the app and build a new APK:

```powershell
# 1. Compile web assets
npm run build

# 2. Sync web build to native Android project
npx cap sync android

# 3. Assemble new APK
cd android
.\gradlew.bat assembleDebug
```
The compiled APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`.
