# Running Tracker App

A mobile-optimized GPS-based running tracker with real-time pace coaching.

## 📁 Project Structure

```
running-tracker/
│
├── index.html          # Main HTML file (entry point)
├── README.md           # This file
│
├── css/
│   └── styles.css      # Custom CSS styles
│
└── js/
    └── app.js          # Main React application logic
```

## 🚀 How to Run

### Option 1: Simple File Open (Recommended for Development)
1. Open `index.html` directly in your browser
2. Grant location permissions when prompted
3. Start tracking your run!

### Option 2: Local Server (Recommended for Testing)
Using Python (if installed):
```bash
# Navigate to the project directory
cd running-tracker

# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

Using Node.js (if installed):
```bash
# Install http-server globally
npm install -g http-server

# Run from project directory
http-server

# Then open: http://localhost:8080
```

Using VS Code Live Server Extension:
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📱 Mobile Testing

To test on your phone:
1. Ensure your computer and phone are on the same network
2. Run a local server (Option 2 above)
3. Find your computer's local IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`
4. On your phone, navigate to: `http://YOUR_IP:8000`

## 🔗 File Dependencies

### index.html links to:
- **CSS:** `css/styles.css` (custom styles)
- **CDN:** Tailwind CSS (styling framework)
- **CDN:** React & ReactDOM (JavaScript framework)
- **CDN:** Babel Standalone (JSX transpiler)
- **JS:** `js/app.js` (main application)

### File Loading Order:
1. Tailwind CSS (CDN)
2. Custom CSS (`css/styles.css`)
3. React libraries (CDN)
4. Babel transpiler (CDN)
5. Application code (`js/app.js`)

## 🎯 Features

- **Real-time GPS tracking** with improved accuracy filtering (ignores readings > 20m accuracy)
- **Enhanced GPS jitter filtering** (ignores movements < 5 meters)
- **10-second rolling average pace** calculation for smoother feedback
- **Customizable goal pace** - Set your target pace before each run
- **Distance targets** - Set a target distance and track progress
- **Progress bar** - Visual indicator showing completion percentage
- **Visual pace coaching** (green = faster than goal, red = slower than goal)
- **Voice announcements** - Hear your pace and motivational feedback every 500m
- **Screen wake lock** - Keeps display on during run
- **Run controls:** Start, Pause, Resume, Finish
- **Summary view** with total time, distance, and average pace
- **Run history storage** - Save runs with notes to browser localStorage
- **Notes feature** - Add observations about each run
- **Run history viewer** - Browse all saved runs with dates and stats
- **Delete runs** - Remove individual runs from history
- **Offline capability** - Service worker caches all assets for minimal data usage
- **PWA support** - Install as an app on your phone's home screen

## 🛠️ Tech Stack

- **HTML5** - Structure
- **CSS3** - Custom styling
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI framework
- **JavaScript (ES6+)** - Application logic
- **Geolocation API** - GPS tracking with enhanced filtering
- **Wake Lock API** - Screen management
- **LocalStorage API** - Run history persistence
- **Web Speech API** - Voice announcements
- **Service Worker API** - Offline caching and PWA support
- **Web App Manifest** - Installable progressive web app

## 📝 Notes

- Requires HTTPS or localhost for Geolocation API to work
- Wake Lock API may not be supported on all devices
- Designed for mobile browsers (Chrome, Safari, Firefox)
- Best used on modern smartphones with GPS
- Run data is stored locally in your browser (not synced across devices)
- Clearing browser data will delete your run history

## 📖 How to Use the App

1. **Start Setup**: Tap "Start New Run" button
2. **Set Goals**: 
   - Enter your target pace (e.g., 5:00 per km)
   - Enter your target distance (e.g., 5.0 km)
   - Tap "Start Run"
3. **During Run**: 
   - Watch your pace - background turns green when on pace, red when slower
   - View progress bar showing distance completion
   - Listen for voice announcements every 500m with pace updates and motivation
4. **Pause/Resume**: Use buttons to take breaks without ending the run
5. **Finish**: Tap "Finish" when done
6. **Add Notes**: Optionally write notes about your run (how it felt, conditions, etc.)
7. **Save**: Tap "Save Run" to store it in your history
8. **View History**: From the home screen, tap "📊 View Run History" to see all saved runs
9. **Delete Runs**: In history view, use the "Delete" button to remove individual runs

### Voice Announcements
Every 500 meters, you'll hear:
- Current distance traveled
- Your current average pace
- Motivational feedback based on your performance vs. goal pace

## 🔧 Customization

### Change GPS Filtering Thresholds
In `js/app.js`, modify:
```javascript
const MAX_GPS_ACCURACY_METERS = 20; // Ignore GPS readings worse than this
const MIN_DISTANCE_THRESHOLD_METERS = 5; // Minimum movement to register
const PACE_SMOOTHING_WINDOW = 5; // Number of samples for 10s rolling average
```

### Change Voice Announcement Frequency
In `js/app.js`, modify:
```javascript
const VOICE_ANNOUNCEMENT_INTERVAL_METERS = 500; // Announce every X meters (default 500m)
```

### Disable Voice Announcements
In `js/app.js`, comment out the voice announcement code in the `startGPSTracking` function:
```javascript
// makeVoiceAnnouncement(newDistance);
```

## 📱 PWA Installation

After visiting the app URL:
- **iPhone**: Safari will prompt to "Add to Home Screen"
- **Android**: Chrome will show an "Install" prompt
- Once installed, the app works offline and uses minimal data!

## 💾 Data Usage

The app is optimized for minimal data usage:
- **First load**: ~500KB (downloads and caches all libraries)
- **Subsequent loads**: 0KB (everything loads from cache)
- **While running**: Only GPS data (< 1KB per run)
- **Service Worker** caches all assets for offline use
- Works perfectly without internet connection after first load

## 📄 License

Free to use and modify for personal projects.
