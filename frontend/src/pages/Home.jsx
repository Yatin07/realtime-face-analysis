import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Upload, Camera, ArrowDown } from 'lucide-react';

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
  const canvasRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const requestRef = useRef(null); // Keeps track of our 60FPS animation loop

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
  // Initialize MediaPipe FaceDetector on load
  useEffect(() => {
    const initializeFaceDetector = async () => {
      try {
        // Dynamically import the MediaPipe ES Module straight from the CDN!
        const { FilesetResolver, FaceDetector } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "CPU"
          },
          runningMode: "VIDEO"
        });
        console.log("MediaPipe FaceDetector loaded!");
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
      }
    };
    initializeFaceDetector();
  }, []);


  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    const file = base64ToFile(imageSrc, 'webcam_photo.jpg');
    setSelectedFile(file);
    setIsWebcamActive(false);
    setIsLiveMode(false); // Stop the animation loop!
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

  // The React Loop Engine!
  useEffect(() => {
    if (isLiveMode) {
      console.log("Starting Live Scanner...");
      let lastVideoTime = -1;

      // --- THE FAST LOOP (60 FPS): In-Browser Drawing ---
      const renderLoop = () => {
        if (webcamRef.current && webcamRef.current.video && faceDetectorRef.current && canvasRef.current) {
          const video = webcamRef.current.video;
          
          if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;

            // Fix 2: sync canvas to actual hardware resolution
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;

            // Detect faces locally in the browser
            const detections = faceDetectorRef.current.detectForVideo(video, performance.now());

            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Fix 4: no face feedback
            if (detections.detections.length === 0) {
              ctx.font = "13px monospace";
              ctx.fillStyle = "#D97757";
              ctx.fillText("no face detected", 12, 24);
            }

            if (detections.detections.length > 0) {
              const bbox = detections.detections[0].boundingBox;

              // Fix 3: mirror is ONLY on the Webcam element (CSS), so the canvas
              // coordinate space is unmirrored — flip X mathematically.
              const flippedX = video.videoWidth - bbox.originX - bbox.width;

              ctx.strokeStyle = "#9FE870";
              ctx.lineWidth = 2;
              ctx.strokeRect(flippedX, bbox.originY, bbox.width, bbox.height);
            }
          }
        }
        // Run this function again on the very next screen paint!
        requestRef.current = requestAnimationFrame(renderLoop);
      };
      
      // Start the fast loop
      requestRef.current = requestAnimationFrame(renderLoop);

      // --- THE SLOW LOOP (1.5 Seconds): Python CNN Inference ---
      liveIntervalRef.current = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            performLiveAnalysis(imageSrc);
          }
        }
      }, 1500); // Changed from 500ms to 1500ms so we don't spam the server
      
    } else {
      // Stop all loops if Live Mode is turned off
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Clear the canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [isLiveMode]);

  return (
    <div className="flex flex-col items-center p-10 font-sans">
      {/* Main Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-white mb-2">AI face attribute analyzer</h1>
        <p className="text-gray-400 font-mono text-sm">Detects 40 facial attributes via on-device crop + CNN inference</p>
      </div>

      {/* Upload Controls Panel */}
      <div className="bg-[#11120F] p-6 rounded-xl border border-[#2A2B27] flex justify-between items-center mb-8 w-full max-w-5xl shadow-2xl">
        <div className="flex space-x-4">
          <label className="bg-theme-lime text-[#11120F] hover:bg-[#8ade5e] px-5 py-2.5 rounded-md cursor-pointer transition font-semibold flex items-center space-x-2 text-sm">
            <Upload size={18} />
            <span>Upload image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <button 
            onClick={() => { 
              const newActiveState = !isWebcamActive;
              setIsWebcamActive(newActiveState); 
              setIsLiveMode(newActiveState); // Auto-start scanning!
              setResults(null); 
            }} 
            className={`px-5 py-2.5 rounded-md transition font-semibold flex items-center space-x-2 text-sm ${isWebcamActive ? 'bg-[#2A2B27] text-white border border-[#444] hover:bg-[#333]' : 'bg-transparent border border-theme-secondaryBorder text-gray-200 hover:text-white hover:bg-[#2A2B27]'}`}
          >
            <Camera size={18} />
            <span>{isWebcamActive ? "Close camera" : "Open camera"}</span>
          </button>
          
          {/* NEW: Bring back the Snap Photo feature when camera is open */}
          {isWebcamActive && (
            <button onClick={capturePhoto} className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-md transition font-semibold flex items-center space-x-2 text-sm">
              <Camera size={18} />
              <span>Snap photo</span>
            </button>
          )}
        </div>
        <div className="text-gray-500 font-mono text-xs">
          jpg • png • webcam
        </div>
      </div>

      <div className="flex flex-row space-x-6 w-full max-w-5xl justify-center items-stretch h-[480px]">

        {/* Left Side: Camera Box */}
        <div className="flex flex-col items-center w-1/2 h-full">

          {isWebcamActive && (
            <div className="flex flex-col items-center bg-[#11120F] border border-[#2A2B27] rounded-xl overflow-hidden shadow-2xl relative w-full h-full">
              
              {/* Floating Status Text OVER the webcam */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 text-theme-lime font-mono text-xs font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-lime animate-pulse"></div>
                <span>face detected</span>
              </div>
              <div className="absolute top-4 right-4 z-10 text-theme-lime font-mono text-xs font-semibold">
                crop +35%/+25%
              </div>

              {/* Fix 1: NO transforms on wrapper or canvas. Fix 2: mirror ONLY on Webcam via inline style. */}
              <div className="relative w-full h-full bg-black flex-grow">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ transform: 'scaleX(-1)' }}
                  className="absolute top-0 left-0 w-full h-full opacity-80"
                  videoConstraints={{ width: 500, height: 400, facingMode: "user" }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>

              {/* Bottom Info Strip */}
              <div className="w-full bg-[#0A0B09] px-4 py-3 border-t border-[#2A2B27] flex justify-between items-center absolute bottom-0 z-10">
                <span className="text-gray-500 font-mono text-xs">inference 42ms • 160x160 tensor</span>
              </div>
            </div>
          )}
          {imagePreview && !isWebcamActive && (
            <div className="flex flex-col items-center bg-[#11120F] border border-[#2A2B27] rounded-xl overflow-hidden shadow-2xl w-full h-full p-4 relative justify-center">
              {/* NEW: inline-block wrapper that shrink-fits to the image's natural aspect ratio */}
              <div className="relative rounded-lg overflow-hidden w-full max-h-full">
                {/* Image is w-full h-auto so it dictates the container's height without letterboxing */}
                <img src={imagePreview} alt="Target face" className="w-full h-auto block rounded-lg" />

                {/* NEW: Draw the bounding box if the backend found a face! */}
                {results && results.box && (
                  <div
                    className="absolute border-2 border-theme-lime rounded-[12px] shadow-[0_0_15px_rgba(159,232,112,0.3)] transition-all duration-300 pointer-events-none"
                    style={{
                      left: `${(results.box.x / results.box.original_w) * 100}%`,
                      top: `${(results.box.y / results.box.original_h) * 100}%`,
                      width: `${(results.box.w / results.box.original_w) * 100}%`,
                      height: `${(results.box.h / results.box.original_h) * 100}%`,
                    }}
                  >
                    {/* Small status strip in the corner of the box */}
                    <span className="absolute -top-6 left-0 text-theme-lime font-mono text-xs whitespace-nowrap px-1.5 py-0.5 font-semibold">
                      • face detected
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 z-10 flex space-x-2">
                <button onClick={handleAnalyze} disabled={isAnalyzing} className={`px-6 py-2 rounded-md font-semibold text-sm transition ${isAnalyzing ? 'bg-[#2A2B27] text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
                  {isAnalyzing ? "Analyzing..." : "Analyze Face"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Results Panel */}
        <div className="w-1/2 h-full">
          {results ? (
            results.error ? (
              <div className="bg-[#11120F] p-6 rounded-xl shadow-2xl w-full border border-theme-rust h-full flex flex-col justify-center items-center text-center px-10">
                 <div className="w-3 h-3 rounded-full bg-theme-rust animate-pulse mb-4"></div>
                 <p className="text-theme-rust font-mono text-sm">{results.error}</p>
                 <p className="text-gray-500 font-mono text-xs mt-2">Try uploading an image with a clearer face.</p>
              </div>
            ) : (
              <div className="bg-[#11120F] p-6 rounded-xl shadow-2xl w-full border border-[#2A2B27] h-full flex flex-col">
                <div className="pb-4 border-b border-[#2A2B27] mb-6 flex flex-row justify-between items-end flex-shrink-0">
                  <h2 className="text-lg font-semibold text-white">Attributes</h2>
                  <p className="text-theme-lime font-mono text-xs mt-1">backend {results.inference_time}</p>
                </div> 

                <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
                  {results.results
                    .slice(0, showAllAttributes ? results.results.length : 5)
                    .sort((a, b) => a.name === 'Blurry' ? 1 : b.name === 'Blurry' ? -1 : 0)
                    .map((attribute, index) => {
                      const isBlurry = attribute.name === 'Blurry';
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
                        <div key={index} className={`flex flex-col mb-5 ${isBlurry ? 'opacity-80' : ''}`}>
                          <div className="flex justify-between mb-1 text-sm tracking-wide">
                            <span className="text-gray-400 font-normal">{attribute.name}</span>
                            <span className={`${textColor} font-mono font-medium`}>{attribute.confidence}%</span>
                          </div>
                          <div className={`w-full h-1 rounded-full ${isBlurry ? 'bg-[#3D2520]' : 'bg-[#1C2018]'}`}>
                            <div
                              className={`${barColor} h-1 transition-all duration-700 rounded-full`}
                              style={{ width: `${attribute.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}

                  {!showAllAttributes && results.results.length === 0 && (
                    <p className="text-center text-gray-400 italic mt-10">No attributes detected.</p>
                  )}
                </div>

                {/* NEW: Pinned toggle button at the bottom */}
                <div className="pt-4 border-t border-[#2A2B27] mt-4 flex justify-center flex-shrink-0">
                  <button
                    onClick={() => setShowAllAttributes(!showAllAttributes)}
                    className="py-1.5 px-4 bg-transparent border border-[#2A2B27] hover:bg-[#2A2B27] rounded-md text-xs font-semibold transition text-gray-400 flex items-center space-x-1"
                  >
                    <span>{showAllAttributes ? "Show top 5" : "Show all 40"}</span>
                    <ArrowDown size={14} className={showAllAttributes ? "rotate-180 transition" : "transition"}/>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-[#11120F] p-6 rounded-xl shadow-2xl w-full border border-[#2A2B27] h-full flex flex-col justify-center items-center">
               <p className="text-gray-500 font-mono text-sm">awaiting feed...</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl mt-6 border-t border-[#2A2B27] pt-4">
        <p className="text-gray-500 font-mono text-xs">
          images processed in-memory, never stored
        </p>
      </div>

    </div>
  )
}

export default Home;
