function About() {
    return (
        <div className="max-w-4xl mx-auto p-10 mt-10 bg-theme-card rounded-xl shadow-2xl border border-theme-border text-gray-200">
            <h2 className="text-4xl font-bold text-white mb-6 border-b border-theme-border pb-4">How This AI Works</h2>

            <div className="space-y-6">
                <section>
                    <h3 className="text-2xl font-semibold text-purple-400 mb-2">1. The Dataset (CelebA)</h3>
                    <p>This neural network was trained on the <strong>CelebA Dataset</strong>, containing over 200,000 celebrity images, each manually labeled with 40 distinct facial attributes.</p>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold text-green-400 mb-2">2. The Deep Learning Architecture</h3>
                    <p>The backend runs a custom <strong>PyTorch Convolutional Neural Network (CNN)</strong>. It uses specialized mathematical layers (Conv2D, BatchNorm, and MaxPool) to automatically extract visual features like edges, textures, and shapes from pixels.</p>
                </section>

                <section>
                    <h3 className="text-2xl font-semibold text-red-400 mb-2">3. The Real-Time Pipeline</h3>
                    <p>To achieve high accuracy, we use a multi-AI pipeline: </p>
                    <ul className="list-disc ml-6 mt-2 text-gray-300">
                        <li><strong>Stage 1 (MediaPipe):</strong> Detects the face and perfectly crops it in milliseconds.</li>
                        <li><strong>Stage 2 (PyTorch):</strong> Analyzes the cropped 160x160 face tensor and outputs predictions.</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default About;
