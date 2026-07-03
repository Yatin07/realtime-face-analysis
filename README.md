<div align="center">
  
# 🤖 Real-Time AI Face Scanner & Attribute Detector

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge&logo=vercel)](https://realtime-face-analysis.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-00A67E?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)

**A full-stack, real-time machine learning application that tracks faces locally at 60 FPS while predicting 40 distinct facial attributes asynchronously.**

[**🚀 Try the Live Web App Here!**](https://realtime-face-analysis.vercel.app/)

</div>

---

## 📌 Executive Summary
This project demonstrates end-to-end expertise in modern web development and deep learning, bridging the gap between complex Neural Networks and consumer-facing web applications. By utilizing a **Decoupled Architecture**, the heavy GPU-based inference engine operates independently from the blazing-fast React User Interface. This allows for highly scalable, real-time facial analysis over the internet, providing a buttery-smooth 60 FPS user experience.

---

## ✨ Key Features
- ⚡ **60 FPS Local Face Tracking:** Uses Google's MediaPipe directly in the browser via WebAssembly to track faces instantly without network latency.
- 🧠 **40-Attribute AI Inference:** A custom-trained PyTorch CNN analyzes the face in the background, predicting features like *Smiling, Wearing Glasses, Wavy Hair, etc.*
- 🎨 **Premium UI/UX:** A stunning, responsive, dark-mode dashboard built with TailwindCSS and Lucide Icons, featuring dynamic progress bars and CSS layout-agnostic canvas drawing.
- 📸 **Upload & Webcam Modes:** Supports both static image uploads and live webcam analysis.

---

## 🏗️ Technical Architecture

The application is split into two distinct microservices communicating via RESTful APIs:

### 1. Frontend: The React Client (Deployed on Vercel)
Built with **Vite, React, and TailwindCSS**, the frontend is engineered for performance and device compatibility.
* **Dual-Loop Architecture:** 
  * A **Fast Loop (60FPS)** handles webcam rendering and MediaPipe face-box drawing entirely on the client side.
  * A **Slow Loop (Asynchronous)** extracts base64 frames every 1.5 seconds and transmits them to the cloud for heavy AI processing.
* **Flawless Canvas Alignment:** Uses advanced CSS shrink-wrapping (`w-full h-auto`) to guarantee pixel-perfect bounding box alignment regardless of camera hardware aspect ratios.
* **Decoupled Deployment:** Hosted on Vercel's Global CDN for zero-latency static file delivery.

### 2. Backend: The AI Engine (Deployed on Render)
Built with **Python, FastAPI, and Uvicorn**, the backend is a specialized API designed exclusively for tensor operations and image matrix mathematics.
* **Stage 1: Smart Cropping:** Raw images contain background noise that destroys CNN accuracy. The backend intercepts the image, runs it through `mediapipe` to isolate facial coordinates, and applies a mathematical **Dynamic Margin** (+35% top, +25% sides) to perfectly crop the face, hair, and jawline.
* **Stage 2: PyTorch CNN Inference:** The isolated facial matrix is downsampled to a `160x160` tensor and passed through our custom PyTorch model.
* **High-Performance Serving:** Hosted on a Render Linux container, locked to Python 3.10 with CPU-optimized PyTorch wheels to prevent memory overflow (OOM) while minimizing inference latency.

---

## 🧠 Machine Learning Details
The core of this application is a **Convolutional Neural Network (CNN)** trained entirely from scratch.

* **Dataset:** Trained on the massive **CelebA** dataset containing over 200,000 images.
* **Multi-Label Classification:** Unlike standard models that predict one class (e.g., Cat vs Dog), this network utilizes a `BCEWithLogitsLoss` function to output 40 independent binary classifications simultaneously.
* **Optimization:** The model's weights (`.pth`) are loaded directly into RAM at server startup using `model.eval()`, ensuring inference takes milliseconds rather than seconds.

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

## ⚠️ Limitations & Known Issues 
* **The Domain Shift Problem:** This model was trained on the **CelebA** dataset, which consists primarily of well-lit, professional, front-facing celebrity photos. A live webcam feed (with harsh room lighting, odd angles, and webcam compression) has significantly different pixel statistics. As a result, the model's confidence may drop on "in the wild" webcam photos.
* **Label Noise:** The CelebA dataset contains known subjective label noise (e.g., tags like "Attractive" or "Young"). The model's predictions inherit these biases directly from the training data.

---

## 🚀 Deployment Status
* **Frontend Hosting:** [Vercel](https://realtime-face-analysis.vercel.app/) (Live UI)
* **Backend Hosting:** Render (Live API)
* **Continuous Integration:** Both services are linked to the `main` branch of this repository for automatic CI/CD deployments on git push.

<br/>

<div align="center">
  <i>Developed by Yatin - Showcasing Full Stack AI Engineering</i>
</div>
