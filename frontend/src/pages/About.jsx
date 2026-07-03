import { Cpu, Maximize, Brain, Server } from 'lucide-react';

function About() {
    return (
        <div className="max-w-4xl mx-auto p-10 mt-10 bg-[#11120F] rounded-xl shadow-2xl border border-[#2A2B27] text-gray-200 font-sans">
            <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#2A2B27] pb-4 flex items-center space-x-3">
                <Brain className="text-theme-lime" size={28} />
                <span>System Architecture & How It Works</span>
            </h2>

            <div className="space-y-10">
                <section>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                        <Cpu className="text-blue-400" size={20} />
                        <span>1. The Frontend Dual-Loop Pipeline</span>
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        To achieve a "live" feel without crashing the browser or spamming the server, this application completely decouples the UI rendering from the heavy AI inference.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#0A0B09] border border-[#2A2B27] p-4 rounded-lg">
                            <h4 className="text-theme-lime font-mono text-sm font-bold mb-2">The Fast Loop (Client-Side Render)</h4>
                            <p className="text-gray-400 text-xs">
                                Runs entirely inside your browser using WebAssembly and Google's <strong>MediaPipe</strong>. It accesses the webcam and uses `requestAnimationFrame` to track faces and draw the green bounding box locally. The exact framerate is bound by your device's hardware and browser performance, ensuring the tracking feels responsive without waiting on network requests.
                            </p>
                        </div>
                        <div className="bg-[#0A0B09] border border-[#2A2B27] p-4 rounded-lg">
                            <h4 className="text-blue-400 font-mono text-sm font-bold mb-2">The Slow Loop (Asynchronous)</h4>
                            <p className="text-gray-400 text-xs">
                                Runs alongside the Fast Loop. Every 1.5 seconds, it silently extracts a base64 frame from the webcam and POSTs it to the Python backend. When the backend eventually responds (100-300ms later), React updates the UI Data Panel without ever pausing the camera feed.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                        <Maximize className="text-theme-rust" size={20} />
                        <span>2. Pixel-Perfect Canvas Alignment</span>
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        A major challenge in browser-based Computer Vision is mapping AI coordinates to CSS scaling. Instead of complex math to account for webcam letterboxing, we use <strong>CSS Shrink-Wrapping</strong>. The webcam is set to `w-full h-auto`, forcing the browser to scale it precisely to its native aspect ratio. The tracking canvas is then placed absolutely over it, sharing the exact same internal `videoWidth` and `videoHeight`. This guarantees the bounding box stays perfectly glued to the face regardless of device screen size.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                        <Server className="text-purple-400" size={20} />
                        <span>3. The Deep Learning Backend</span>
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        The backend is a high-performance Python FastAPI server acting purely as an inference engine. It performs a two-stage process:
                    </p>
                    <ul className="space-y-3 text-sm text-gray-400 ml-2">
                        <li className="flex space-x-2">
                            <span className="text-purple-400 font-bold">•</span>
                            <span><strong>Dynamic Smart Cropping:</strong> Raw images contain background noise. The backend uses its own MediaPipe pass to find the face, applies a mathematical margin (+35% top, +25% sides) to include hair and jawline, and crops the image strictly to the head.</span>
                        </li>
                        <li className="flex space-x-2">
                            <span className="text-purple-400 font-bold">•</span>
                            <span><strong>PyTorch CNN:</strong> The cropped image is converted to a 160x160 tensor and fed into a custom-trained Convolutional Neural Network. Using a `BCEWithLogitsLoss` function, it calculates 40 independent binary classifications simultaneously in milliseconds.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-xl font-semibold text-white mb-3">4. Training Data & Limitations</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        The neural network was trained from scratch using the <strong>CelebA Dataset</strong> (200,000+ celebrity images). Because of the aggressive facial cropping used to improve general accuracy, features outside the immediate face (like <i>Neckties</i> or <i>Necklaces</i>) are often cut out, leading to unpredictable results for those specific traits. Additionally, predictions inherit the subjective biases of the original dataset labelers (e.g., subjective tags like "Attractive" or "Young").
                    </p>
                </section>
            </div>
        </div>
    );
}

export default About;
