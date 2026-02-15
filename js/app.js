const { useState, useEffect, useRef } = React;

// ========================================
// CONSTANTS
// ========================================
const GOAL_PACE_SECONDS_PER_KM = 5 * 60; // 5:00 per kilometre
const EARTH_RADIUS_KM = 6371;
const MIN_DISTANCE_THRESHOLD_METERS = 3; // Filter out GPS updates < 3m
const PACE_SMOOTHING_WINDOW = 5; // Number of samples for pace smoothing
const GPS_OPTIONS = {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 10000
};
const STORAGE_KEY = 'running_tracker_history'; // LocalStorage key for run history

// ========================================
// STORAGE HELPER FUNCTIONS
// ========================================

/**
 * Load run history from localStorage
 * @returns {Array} Array of saved runs
 */
function loadRunHistory() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading run history:', error);
        return [];
    }
}

/**
 * Save a run to localStorage
 * @param {Object} runData - The run data to save
 */
function saveRun(runData) {
    try {
        const history = loadRunHistory();
        history.unshift(runData); // Add to beginning of array
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving run:', error);
    }
}

/**
 * Delete a run from history
 * @param {string} runId - The ID of the run to delete
 */
function deleteRun(runId) {
    try {
        const history = loadRunHistory();
        const filtered = history.filter(run => run.id !== runId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting run:', error);
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.asin(Math.sqrt(a));
    
    return EARTH_RADIUS_KM * c * 1000; // Return in meters
}

/**
 * Format time in seconds as HH:MM:SS or MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format pace as MM:SS/km
 * @param {number} secondsPerKm - Pace in seconds per kilometre
 * @returns {string} Formatted pace string
 */
function formatPace(secondsPerKm) {
    if (!isFinite(secondsPerKm) || secondsPerKm <= 0) {
        return "–:–";
    }
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.floor(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// ========================================
// COMPONENTS
// ========================================

/**
 * Status Bar Component
 * Displays run state, GPS status, and wake lock toggle
 */
function StatusBar({ runState, gpsStatus, keepAwake, setKeepAwake, wakeLockSupported }) {
    const stateLabels = {
        idle: 'Ready',
        running: 'Running',
        paused: 'Paused',
        finished: 'Finished'
    };

    return (
        <div className="bg-black bg-opacity-30 p-4 space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{stateLabels[runState]}</span>
                <span className="text-xs">GPS: {gpsStatus}</span>
            </div>
            
            {wakeLockSupported ? (
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs">Keep screen awake</span>
                    <input
                        type="checkbox"
                        checked={keepAwake}
                        onChange={(e) => setKeepAwake(e.target.checked)}
                        className="w-5 h-5"
                    />
                </label>
            ) : (
                <div className="text-xs opacity-50">Wake lock not supported</div>
            )}
        </div>
    );
}

/**
 * Metric Display Component
 * Shows current pace, distance, and time during run
 */
function MetricDisplay({ currentPace, distance, time, runState }) {
    return (
        <div className="text-center space-y-8 mb-12">
            {/* Current Pace - Largest */}
            <div>
                <div className="text-sm uppercase tracking-wider opacity-75 mb-2">Current Pace</div>
                <div className="text-8xl font-bold tabular-nums metric-text">
                    {currentPace !== null ? formatPace(currentPace) : '–:–'}
                </div>
                <div className="text-2xl opacity-75 mt-1">/km</div>
            </div>

            {/* Distance and Time */}
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Distance</div>
                    <div className="text-5xl font-bold tabular-nums metric-text">{distance}</div>
                    <div className="text-lg opacity-75">km</div>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wider opacity-75 mb-1">Time</div>
                    <div className="text-5xl font-bold tabular-nums metric-text">{formatTime(time)}</div>
                </div>
            </div>

            {/* Goal indicator */}
            <div className="text-sm opacity-75">
                Goal: {formatPace(GOAL_PACE_SECONDS_PER_KM)}/km
            </div>
        </div>
    );
}

/**
 * Controls Component
 * Start, Pause, Resume, and Finish buttons
 */
function Controls({ runState, onStart, onPause, onResume, onFinish }) {
    const buttonClass = "px-12 py-6 text-2xl font-bold rounded-lg shadow-lg active:scale-95 transition-transform";
    
    return (
        <div className="space-y-4 w-full max-w-sm">
            {runState === 'idle' && (
                <button
                    onClick={onStart}
                    className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white w-full`}
                >
                    Start Run
                </button>
            )}

            {runState === 'running' && (
                <>
                    <button
                        onClick={onPause}
                        className={`${buttonClass} bg-yellow-500 hover:bg-yellow-600 text-white w-full`}
                    >
                        Pause
                    </button>
                    <button
                        onClick={onFinish}
                        className={`${buttonClass} bg-red-500 hover:bg-red-600 text-white w-full`}
                    >
                        Finish
                    </button>
                </>
            )}

            {runState === 'paused' && (
                <>
                    <button
                        onClick={onResume}
                        className={`${buttonClass} bg-green-500 hover:bg-green-600 text-white w-full`}
                    >
                        Resume
                    </button>
                    <button
                        onClick={onFinish}
                        className={`${buttonClass} bg-red-500 hover:bg-red-600 text-white w-full`}
                    >
                        Finish
                    </button>
                </>
            )}
        </div>
    );
}

/**
 * Summary View Component
 * Displays run summary after finish with ability to add notes and save
 */
function SummaryView({ totalTime, totalDistance, onNewRun, onSaveRun }) {
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const avgPace = (totalTime / parseFloat(totalDistance));
    
    const handleSave = () => {
        onSaveRun(notes);
        setSaved(true);
    };
    
    return (
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-8">Run Summary</h2>
            
            <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <span className="text-lg opacity-75">Total Time</span>
                    <span className="text-3xl font-bold">{formatTime(totalTime)}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <span className="text-lg opacity-75">Total Distance</span>
                    <span className="text-3xl font-bold">{totalDistance} km</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <span className="text-lg opacity-75">Average Pace</span>
                    <span className="text-3xl font-bold">{formatPace(avgPace)}/km</span>
                </div>

                {/* Notes Input */}
                <div className="pt-4">
                    <label className="block text-sm opacity-75 mb-2">Run Notes (optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did this run feel? Any observations?"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        rows="4"
                        disabled={saved}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {!saved ? (
                    <button
                        onClick={handleSave}
                        className="w-full px-8 py-4 text-xl font-bold bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg active:scale-95 transition-transform"
                    >
                        Save Run
                    </button>
                ) : (
                    <div className="w-full px-8 py-4 text-center text-green-400 font-semibold bg-green-900 bg-opacity-30 rounded-lg">
                        ✓ Run Saved
                    </div>
                )}
                
                <button
                    onClick={onNewRun}
                    className="w-full px-8 py-4 text-xl font-bold bg-green-500 hover:bg-green-600 rounded-lg shadow-lg active:scale-95 transition-transform"
                >
                    Start New Run
                </button>
            </div>
        </div>
    );
}

/**
 * Run History Component
 * Displays list of all saved runs
 */
function RunHistory({ onClose, onDeleteRun }) {
    const [history, setHistory] = useState(loadRunHistory());
    const [expandedId, setExpandedId] = useState(null);

    const handleDelete = (runId) => {
        if (confirm('Are you sure you want to delete this run?')) {
            deleteRun(runId);
            setHistory(loadRunHistory());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Run History</h2>
                    <button
                        onClick={onClose}
                        className="text-4xl leading-none hover:text-gray-400 transition-colors"
                    >
                        ×
                    </button>
                </div>

                {history.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No runs saved yet. Complete a run to see it here!</p>
                ) : (
                    <div className="space-y-4">
                        {history.map((run) => (
                            <div key={run.id} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-sm text-gray-400">{formatDate(run.date)}</div>
                                        <div className="text-2xl font-bold mt-1">{run.distance} km</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(run.id)}
                                        className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-red-900 hover:bg-opacity-30 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-400">Time: </span>
                                        <span className="font-semibold">{formatTime(run.time)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Pace: </span>
                                        <span className="font-semibold">{formatPace(run.avgPace)}/km</span>
                                    </div>
                                </div>

                                {run.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-600">
                                        <button
                                            onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                                            className="text-sm text-blue-400 hover:text-blue-300 mb-2"
                                        >
                                            {expandedId === run.id ? '▼ Hide notes' : '▶ Show notes'}
                                        </button>
                                        {expandedId === run.id && (
                                            <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded">
                                                {run.notes}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-6 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ========================================
// MAIN APP COMPONENT
// ========================================

function App() {
    // Run state machine: idle, running, paused, finished
    const [runState, setRunState] = useState('idle');
    
    // View state: 'tracker' or 'history'
    const [view, setView] = useState('tracker');
    
    // GPS tracking
    const [gpsPoints, setGpsPoints] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0); // in meters
    const [gpsStatus, setGpsStatus] = useState('Not started');
    const watchIdRef = useRef(null);
    
    // Timer
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const pausedTimeRef = useRef(0);
    
    // Pace smoothing
    const paceWindowRef = useRef([]);
    
    // Wake lock
    const [keepAwake, setKeepAwake] = useState(false);
    const [wakeLockSupported, setWakeLockSupported] = useState(true);
    const wakeLockRef = useRef(null);

    // Current run data for saving
    const [currentRunData, setCurrentRunData] = useState(null);

    // Check wake lock support on mount
    useEffect(() => {
        if (!('wakeLock' in navigator)) {
            setWakeLockSupported(false);
        }
    }, []);

    // Wake lock management
    useEffect(() => {
        async function handleWakeLock() {
            if (keepAwake && wakeLockSupported) {
                try {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    console.log('Wake lock acquired');
                } catch (err) {
                    console.error('Wake lock failed:', err);
                }
            } else if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
                console.log('Wake lock released');
            }
        }
        
        handleWakeLock();
        
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
    }, [keepAwake, wakeLockSupported]);

    /**
     * Start GPS tracking using watchPosition
     */
    function startGPSTracking() {
        if (!navigator.geolocation) {
            setGpsStatus('GPS not supported');
            return;
        }

        setGpsStatus('Acquiring GPS...');

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setGpsStatus('Tracking');
                
                const newPoint = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    timestamp: position.timestamp,
                    accuracy: position.coords.accuracy
                };

                setGpsPoints((prevPoints) => {
                    const updated = [...prevPoints, newPoint];
                    
                    // Calculate distance increment if we have a previous point
                    if (prevPoints.length > 0) {
                        const lastPoint = prevPoints[prevPoints.length - 1];
                        const distanceIncrement = haversineDistance(
                            lastPoint.lat,
                            lastPoint.lon,
                            newPoint.lat,
                            newPoint.lon
                        );

                        // GPS jitter filter: only add distance if > threshold
                        if (distanceIncrement >= MIN_DISTANCE_THRESHOLD_METERS) {
                            setTotalDistance((prev) => prev + distanceIncrement);
                        }
                    }
                    
                    return updated;
                });
            },
            (error) => {
                console.error('GPS error:', error);
                if (error.code === 1) {
                    setGpsStatus('Permission denied');
                } else if (error.code === 2) {
                    setGpsStatus('Position unavailable');
                } else if (error.code === 3) {
                    setGpsStatus('Timeout');
                }
            },
            GPS_OPTIONS
        );
    }

    /**
     * Stop GPS tracking
     */
    function stopGPSTracking() {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }

    /**
     * Start the run timer
     */
    function startTimer() {
        startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
        
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setElapsedTime(elapsed);
        }, 1000);
    }

    /**
     * Pause the run timer
     */
    function pauseTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        pausedTimeRef.current = elapsedTime;
    }

    /**
     * Reset the timer completely
     */
    function resetTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setElapsedTime(0);
        pausedTimeRef.current = 0;
        startTimeRef.current = null;
    }

    // ========================================
    // RUN CONTROL HANDLERS
    // ========================================

    function handleStart() {
        setRunState('running');
        startGPSTracking();
        startTimer();
    }

    function handlePause() {
        setRunState('paused');
        stopGPSTracking();
        pauseTimer();
    }

    function handleResume() {
        setRunState('running');
        startGPSTracking();
        startTimer();
    }

    function handleFinish() {
        setRunState('finished');
        stopGPSTracking();
        pauseTimer();
        
        // Store current run data for saving
        const distanceKm = (totalDistance / 1000).toFixed(2);
        const avgPace = elapsedTime / parseFloat(distanceKm);
        
        setCurrentRunData({
            time: elapsedTime,
            distance: distanceKm,
            avgPace: avgPace,
            date: new Date().toISOString()
        });
    }

    function handleNewRun() {
        setRunState('idle');
        setGpsPoints([]);
        setTotalDistance(0);
        setGpsStatus('Not started');
        resetTimer();
        paceWindowRef.current = [];
        setCurrentRunData(null);
    }

    /**
     * Save the current run with notes to localStorage
     * @param {string} notes - User's notes about the run
     */
    function handleSaveRun(notes) {
        if (currentRunData) {
            const runToSave = {
                ...currentRunData,
                notes: notes,
                id: Date.now().toString() // Simple unique ID
            };
            saveRun(runToSave);
        }
    }

    /**
     * Open run history view
     */
    function handleViewHistory() {
        setView('history');
    }

    /**
     * Close run history and return to tracker
     */
    function handleCloseHistory() {
        setView('tracker');
    }

    /**
     * Calculate current pace with smoothing
     * @returns {number|null} Current pace in seconds per km, or null if insufficient data
     */
    function getCurrentPace() {
        const distanceKm = totalDistance / 1000;
        
        if (distanceKm < 0.01 || elapsedTime < 1) {
            return null; // Not enough data
        }

        const paceSecondsPerKm = elapsedTime / distanceKm;
        
        // Simple moving average smoothing
        paceWindowRef.current.push(paceSecondsPerKm);
        if (paceWindowRef.current.length > PACE_SMOOTHING_WINDOW) {
            paceWindowRef.current.shift();
        }
        
        const smoothedPace = paceWindowRef.current.reduce((a, b) => a + b, 0) / paceWindowRef.current.length;
        return smoothedPace;
    }

    const currentPace = getCurrentPace();
    const distanceKm = (totalDistance / 1000).toFixed(2);

    /**
     * Determine background color based on pace vs goal
     * @returns {string} Tailwind CSS class for background color
     */
    function getBackgroundColor() {
        if (runState === 'idle' || runState === 'finished') {
            return 'bg-gray-900';
        }
        
        if (currentPace === null) {
            return 'bg-gray-900'; // Neutral when no pace data
        }
        
        if (currentPace < GOAL_PACE_SECONDS_PER_KM) {
            return 'bg-green-600'; // Faster than goal
        } else {
            return 'bg-red-600'; // Slower than goal
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopGPSTracking();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <>
            {view === 'history' && (
                <RunHistory 
                    onClose={handleCloseHistory}
                />
            )}
            
            <div className={`min-h-screen ${getBackgroundColor()} transition-colors duration-500 text-white flex flex-col`}>
                {/* Status Bar */}
                <StatusBar 
                    runState={runState}
                    gpsStatus={gpsStatus}
                    keepAwake={keepAwake}
                    setKeepAwake={setKeepAwake}
                    wakeLockSupported={wakeLockSupported}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center items-center px-4">
                    {runState === 'finished' ? (
                        <SummaryView
                            totalTime={elapsedTime}
                            totalDistance={distanceKm}
                            onNewRun={handleNewRun}
                            onSaveRun={handleSaveRun}
                        />
                    ) : (
                        <>
                            <MetricDisplay
                                currentPace={currentPace}
                                distance={distanceKm}
                                time={elapsedTime}
                                runState={runState}
                            />
                            
                            <Controls
                                runState={runState}
                                onStart={handleStart}
                                onPause={handlePause}
                                onResume={handleResume}
                                onFinish={handleFinish}
                            />

                            {/* History Button - Only show when idle */}
                            {runState === 'idle' && (
                                <button
                                    onClick={handleViewHistory}
                                    className="mt-6 px-8 py-3 text-lg bg-gray-700 hover:bg-gray-600 rounded-lg shadow-lg active:scale-95 transition-transform"
                                >
                                    📊 View Run History
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ========================================
// RENDER APP
// ========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

