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

- **Real-time GPS tracking** using Geolocation API
- **Live pace calculation** with smoothing algorithm
- **Visual pace coaching** (green = faster than 5:00/km goal, red = slower)
- **GPS jitter filtering** (ignores movements < 3 meters)
- **Screen wake lock** (keeps display on during run)
- **Run controls:** Start, Pause, Resume, Finish
- **Summary view** with total time, distance, and average pace
- **Run history storage** - Save runs with notes to browser localStorage
- **Notes feature** - Add observations about each run
- **Run history viewer** - Browse all saved runs with dates and stats
- **Delete runs** - Remove individual runs from history

## 🛠️ Tech Stack

- **HTML5** - Structure
- **CSS3** - Custom styling
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI framework
- **JavaScript (ES6+)** - Application logic
- **Geolocation API** - GPS tracking
- **Wake Lock API** - Screen management
- **LocalStorage API** - Run history persistence

## 📝 Notes

- Requires HTTPS or localhost for Geolocation API to work
- Wake Lock API may not be supported on all devices
- Designed for mobile browsers (Chrome, Safari, Firefox)
- Best used on modern smartphones with GPS
- Run data is stored locally in your browser (not synced across devices)
- Clearing browser data will delete your run history

## 📖 How to Use the App

1. **Start a Run**: Tap "Start Run" button
2. **During Run**: Watch your pace change background color (green = on pace, red = slower)
3. **Pause/Resume**: Use buttons to take breaks without ending the run
4. **Finish**: Tap "Finish" when done
5. **Add Notes**: Optionally write notes about your run (how it felt, conditions, etc.)
6. **Save**: Tap "Save Run" to store it in your history
7. **View History**: From the home screen, tap "📊 View Run History" to see all saved runs
8. **Delete Runs**: In history view, use the "Delete" button to remove individual runs

## 🔧 Customization

### Change Goal Pace
In `js/app.js`, modify:
```javascript
const GOAL_PACE_SECONDS_PER_KM = 5 * 60; // Change 5 to your target minutes/km
```

### Adjust GPS Filtering
In `js/app.js`, modify:
```javascript
const MIN_DISTANCE_THRESHOLD_METERS = 3; // Minimum movement to register
const PACE_SMOOTHING_WINDOW = 5; // Number of samples for pace averaging
```

## 📄 License

Free to use and modify for personal projects.
