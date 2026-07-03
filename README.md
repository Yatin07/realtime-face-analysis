<div align="center">
  
# 🤖 Real-Time AI Face Scanner & Attribute Detector

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge&logo=vercel)](https://realtime-face-analysis.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-00A67E?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)

**A full-stack machine learning application that tracks faces locally in the browser while predicting 40 distinct facial attributes asynchronously.**

[**🚀 Try the Live Web App Here!**](https://realtime-face-analysis.vercel.app/)

</div>

---

## 📌 Executive Summary
This project demonstrates end-to-end expertise in modern web development and deep learning, bridging the gap between complex Neural Networks and consumer-facing web applications. By utilizing a **Decoupled Architecture**, the heavy GPU-based inference engine operates independently from the React User Interface. This allows for scalable, real-time facial analysis over the internet, providing a responsive user experience.

---

## ✨ Key Features
- ⚡ **In-Browser Face Tracking:** Uses Google's MediaPipe directly in the browser via WebAssembly to track faces instantly without network round-trips.
- 🧠 **40-Attribute AI Inference:** A custom-trained PyTorch CNN analyzes the face in the background, predicting features like *Smiling, Wearing Glasses, Wavy Hair, etc.*
- 🎨 **Premium UI/UX:** A responsive, dark-mode dashboard built with TailwindCSS and Lucide Icons, featuring dynamic progress bars and CSS layout-agnostic canvas drawing.
- 📸 **Upload & Webcam Modes:** Supports both static image uploads and live webcam analysis.

---

## 🏗️ Technical Architecture

The application is split into two distinct microservices communicating via RESTful APIs:

### 1. Frontend: The React Client (Deployed on Vercel)
Built with **Vite, React, and TailwindCSS**, the frontend is engineered for performance and device compatibility.
* **Dual-Loop Architecture:** 
  * A **Client-Side Render Loop** handles webcam rendering and MediaPipe face-box drawing locally.
  * An **Asynchronous Inference Loop** extracts base64 frames every 1.5 seconds and transmits them to the cloud for heavy AI processing.
* **Flawless Canvas Alignment:** Uses advanced CSS shrink-wrapping (`w-full h-auto`) to guarantee pixel-perfect bounding box alignment regardless of camera hardware aspect ratios.
* **Decoupled Deployment:** Hosted on Vercel's Global CDN for fast static file delivery.

### 2. Backend: The AI Engine (Deployed on Render)
Built with **Python, FastAPI, and Uvicorn**, the backend is a specialized API designed exclusively for tensor operations and image matrix mathematics.
* **Stage 1: Smart Cropping:** Raw images contain background noise that destroys CNN accuracy. The backend intercepts the image, runs it through `mediapipe` to isolate facial coordinates, and applies a mathematical **Dynamic Margin** (+35% top, +25% sides) to crop the face and hair.
* **Stage 2: PyTorch CNN Inference:** The isolated facial matrix is downsampled to a `160x160` tensor and passed through our custom PyTorch model.
* **High-Performance Serving:** Hosted on a Render Linux container, locked to Python 3.10 with CPU-optimized PyTorch wheels to prevent memory overflow (OOM) while minimizing inference latency.

---

## 🧠 Machine Learning Details
The core of this application is a **Convolutional Neural Network (CNN)** trained entirely from scratch.

* **Dataset:** Trained on the **CelebA** dataset containing over 200,000 images.
* **Multi-Label Classification:** Unlike standard models that predict one class (e.g., Cat vs Dog), this network utilizes a `BCEWithLogitsLoss` function to output 40 independent binary classifications simultaneously.
* **Optimization:** The model's weights (`.pth`) are loaded directly into RAM at server startup using `model.eval()`, ensuring fast inference.

---

## 💻 Running the Project Locally

If you are a recruiter or developer looking to run the codebase locally:

### Prerequisites
* **Python 3.10+**
* **Node.js v18+**

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*The API will start on `http://localhost:8000`*

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*The UI will start on `http://localhost:5173`*

---

## ⚠️ Limitations & Known Issues (Honest Assessment)
As an interview project, it is important to be transparent about the realistic limitations of the current implementation. There is **no guarantee** of perfectly accurate predictions for every image or frame, due to several practical constraints:

1. **The Cropping Constraint (Missing Context):** To improve facial recognition, the backend aggressively crops the image around the face (with slight margins). However, this means the **neck and shoulder areas are completely cropped out**. Consequently, attributes like *Wearing_Necktie* or *Wearing_Necklace* will often predict incorrectly because the network literally cannot see those items in the cropped tensor.
2. **The Domain Shift Problem:** This model was trained on the **CelebA** dataset, which consists primarily of well-lit, professional, front-facing celebrity photos. A live webcam feed often introduces harsh room lighting, odd angles, shadows, and heavy webcam compression. This discrepancy (domain shift) naturally lowers the model's confidence and accuracy on "in the wild" webcam photos.
3. **Label Noise & Subjectivity:** The CelebA training dataset contains known subjective label noise. Tags like "Attractive", "Young", or "Chubby" are highly subjective and inherently biased based on the original labelers. The model's predictions reflect these biases directly.
4. **Hardware Performance vs. Reality:** While the application uses a decoupled dual-loop architecture to keep the UI responsive, real-world hardware limits apply. The frontend webcam rendering is bound by the user's browser performance (not a strict 60 FPS), and the backend inference runs on a free-tier Render CPU without a GPU delegate, resulting in noticeable latency per prediction (approx. 100-300ms + network travel time). 

---

## 🚀 Deployment Status
* **Frontend Hosting:** [Vercel](https://realtime-face-analysis.vercel.app/) (Live UI)
* **Backend Hosting:** [Render](https://realtime-face-analysis-1.onrender.com/) (Live API)
* **Continuous Integration:** Both services are linked to the `main` branch of this repository for automatic CI/CD deployments on git push.

<br/>

<div align="center">
  <i>Developed by Yatin - Showcasing Full Stack AI Engineering</i>
</div>
