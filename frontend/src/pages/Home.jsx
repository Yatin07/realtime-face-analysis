import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Home() {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Track if we are in "Live Scanner" mode
  const [isLiveMode, setIsLiveMode] = useState(false);
  // State to toggle showing all 40 attributes or just the confident ones
  const [showAllAttributes, setShowAllAttributes] = useState(false);

  const webcamRef = useRef(null);
  const liveIntervalRef = useRef(null); // Keeps track of our timer

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setSelectedFile(file);
      setResults(null);
      setIsWebcamActive(false);
      setIsLiveMode(false);
    }
  };

  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    const file = base64ToFile(imageSrc, 'webcam_photo.jpg');
    setSelectedFile(file);
    setIsWebcamActive(false);
    setResults(null);
  }, [webcamRef]);

  // Standard Manual Analysis (For Uploads / Single Photos)
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error analyzing:", error);
      alert("Failed to connect to Python backend.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Silent Analysis function for the Live Loop
  const performLiveAnalysis = async (imageSrc) => {
    const file = base64ToFile(imageSrc, 'live_frame.jpg');
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Live analysis failed:", error);
      setIsLiveMode(false); // Stop if the server crashes
    }
  };

  // The React Loop engine! 
  // This watches `isLiveMode` and starts/stops the 500ms timer
  useEffect(() => {
    if (isLiveMode) {
      console.log("Starting Live Scanner...");
      liveIntervalRef.current = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            performLiveAnalysis(imageSrc);
          }
        }
      }, 500); // 500ms = 2 FPS
    } else {
      // Stop the timer if Live Mode is turned off
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    }

    // Cleanup rule: Always clear timers if the component is destroyed
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    }
  }, [isLiveMode]);

  return (
    <div className="flex flex-col items-center p-10">
      {/* <h1 className="text-4xl font-bold text-blue-400 mb-8">AI Face Attribute Analyzer</h1> */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">AI Face Attribute Analyzer</h1>
        <p className="text-gray-400 font-mono text-sm">Detects 40 facial attributes via on-device crop + CNN inference</p>
      </div>

      {/* Top Controls */}
      <div className="bg-theme-card p-8 rounded-xl border border-theme-border flex flex-col items-center mb-8 w-full max-w-6xl">

        {/* <div className="bg-gray-800 p-8 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center mb-8"> */}
        <p className="mb-6 text-gray-300">Upload a photo or use your camera</p>
        <div className="flex space-x-4">
          <label className="bg-theme-lime text-theme-text hover:bg-[#8ade5e] px-6 py-2 rounded-lg cursor-pointer transition font-semibold">
            Upload Image
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <button onClick={() => { setIsWebcamActive(true); setResults(null); }} className="bg-transparent border border-theme-secondaryBorder text-white hover:bg-theme-border px-6 py-2 rounded-lg transition font-semibold flex items-center space-x-2">
            Open Camera
          </button>
        </div>
      </div>

      <div className="flex flex-row space-x-12 w-full max-w-6xl justify-center items-start">

        {/* Left Side: Camera or Image Box */}
        <div className="flex flex-col items-center">

          {isWebcamActive && (
            <div className="flex flex-col items-center bg-theme-card border-theme-border p-4 rounded-xl border shadow-2xl">
              {/* Added a red recording indicator if live mode is on */}
              {isLiveMode && <div className="absolute animate-pulse bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 -mt-2 -ml-[300px]">LIVE AI</div>}

              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg mb-4 border border-theme-border w-96 h-96 object-cover"
                videoConstraints={{ width: 400, height: 400, facingMode: "user" }}
              />

              <div className="flex space-x-4 w-full justify-center">
                <button onClick={capturePhoto} disabled={isLiveMode} className={`px-4 py-2 rounded-lg font-bold ${isLiveMode ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  Snap Photo
                </button>
                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`px-4 py-2 rounded-lg font-bold ${isLiveMode ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isLiveMode ? 'Stop Live Scan' : 'Start Live Scan'}
                </button>
                <button onClick={() => { setIsWebcamActive(false); setIsLiveMode(false); }} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg">
                  Close
                </button>
              </div>
            </div>
          )}

          {imagePreview && !isWebcamActive && (
            <div className="flex flex-col items-center">
              <img src={imagePreview} alt="Target face" className="w-96 h-96 object-cover rounded-lg shadow-lg border border-theme-border mb-4" />
              <button
                onClick={handleAnalyze} disabled={isAnalyzing}
                className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-transform transform mt-2 ${isAnalyzing ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'}`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Face'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Results Panel */}
        {results && (
          <div className="bg-theme-card p-6 rounded-xl shadow-xl w-full max-w-md border border-theme-border h-[600px] overflow-y-auto flex flex-col">
            {/* <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-700 h-[600px] overflow-y-auto flex flex-col"> */}
            <div className="sticky top-0 bg-theme-card pb-4 border-b border-theme-border mb-4 z-10 flex-shrink-0">
              <h2 className="text-2xl font-bold text-center">Analysis Results</h2>
              <p className="text-center text-green-400 font-mono text-sm mt-1">Backend Speed: {results.inference_time}</p>
            </div>

            <div className="space-y-4 flex-grow">
              {results.results
                .filter(attribute => showAllAttributes ? true : attribute.confidence > 40.0)
                // NEW: Push "Blurry" to the bottom of the list without deleting it
                .sort((a, b) => a.name === 'Blurry' ? 1 : b.name === 'Blurry' ? -1 : 0)
                .map((attribute, index) => {
                  const isBlurry = attribute.name === 'Blurry';

                  // NEW: Claude's 3-Tier Confidence Color System
                  let barColor = 'bg-theme-lime';
                  let textColor = 'text-theme-lime';

                  if (isBlurry || attribute.confidence < 40.0) {
                    barColor = 'bg-theme-rust';
                    textColor = 'text-theme-rust';
                  } else if (attribute.confidence < 80.0) {
                    barColor = 'bg-theme-olive';
                    textColor = 'text-theme-olive';
                  }

                  return (
                    // If it's blurry, we make the whole row slightly faded
                    <div key={index} className={`flex flex-col mb-4 ${isBlurry ? 'opacity-50 scale-95 origin-left' : ''}`}>
                      {/* NEW: font-mono added to make the text look like instrument data */}
                      <div className="flex justify-between mb-1 font-mono text-sm tracking-wide">
                        <span className="text-gray-300">{attribute.name.toLowerCase()}</span>
                        <span className={textColor}>{attribute.confidence}%</span>
                      </div>

                      {/* NEW: Sharp edge progress bar instead of rounded-full */}
                      <div className="w-full bg-theme-border h-1">
                        <div
                          className={`${barColor} h-1 transition-all duration-700`}
                          style={{ width: `${attribute.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}


              {/* NEW: Display a message if nothing was confident enough */}
              {!showAllAttributes && results.results.filter(a => a.confidence > 40.0).length === 0 && (
                <p className="text-center text-gray-400 italic mt-10">No highly confident attributes detected.</p>
              )}
            </div>

            {/* NEW: The Toggle Button at the bottom */}
            <div className="sticky bottom-0 bg-theme-card pt-4 border-t border-theme-border mt-6 z-10">
              <button
                onClick={() => setShowAllAttributes(!showAllAttributes)}
                className="w-full py-2 bg-theme-border hover:bg-theme-secondaryBorder rounded-lg text-sm font-semibold transition"
              >
                {showAllAttributes ? "Show Only Top Predictions" : "Expand All 40 Attributes"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default Home;
