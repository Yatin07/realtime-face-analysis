<div align="center">
  
# 🤖 Real-Time AI Face Scanner & Attribute Detector

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge)](https://realtime-face-analysis.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)

**A full-stack machine learning application that analyzes live webcam feeds in real-time, predicting 40 distinct facial attributes simultaneously.**

</div>

## 📌 Executive Summary
This project demonstrates end-to-end expertise in modern web development and deep learning. It bridges the gap between complex Neural Networks and consumer-facing web applications. By utilizing a **Decoupled Architecture**, the heavy GPU-based inference engine operates independently from the blazing-fast React User Interface, allowing for highly scalable, real-time facial analysis over the internet.

---

## 🏗️ Technical Architecture

The application is split into two distinct microservices communicating via RESTful APIs:

### 1. Frontend: The React Client (Vercel)
Built with **Vite, React, and TailwindCSS**, the frontend is engineered for performance and device compatibility.
* **Continuous Scanning Loop:** Implements an asynchronous React `useEffect` loop that extracts base64 frames from the user's webcam at 2 FPS and transmits them to the cloud.
* **Single Page Application (SPA):** Uses `react-router-dom` to maintain the webcam state across different pages without forcing browser refreshes.
* **Decoupled Deployment:** Hosted on Vercel's Global CDN for zero-latency static file delivery.

### 2. Backend: The AI Engine (Render)
Built with **Python, FastAPI, and Uvicorn**, the backend is a specialized API designed exclusively for tensor operations and image matrix mathematics.
* **Stage 1: Google MediaPipe Face Detection:** Raw images contain background noise that destroys Convolutional Neural Network (CNN) accuracy. The backend intercepts the image, runs it through `mediapipe` to isolate facial coordinates, and applies a mathematical **Dynamic Margin** (+35% top, +25% sides) to perfectly crop the face, hair, and jawline.
* **Stage 2: PyTorch CNN Inference:** The isolated facial matrix is downsampled to a `160x160` tensor and passed through a custom-trained PyTorch CNN.
* **High-Performance Serving:** Hosted on a Render Linux container, locked to Python 3.10 with CPU-optimized PyTorch wheels to prevent memory overflow (OOM) while minimizing inference latency.

---

## 🧠 Machine Learning Details
The core of this application is a **Convolutional Neural Network** trained entirely from scratch.

* **Dataset:** Trained on the massive **CelebA** dataset containing 200,000+ images.
* **Multi-Label Classification:** Unlike standard models that predict one class (e.g., Cat vs Dog), this network utilizes a `BCEWithLogitsLoss` function to output 40 independent binary classifications simultaneously.
* **Monitored Attributes:** Includes predictions for features like *Smiling, Wearing Glasses, Wavy Hair, Wearing Hat, No Beard,* and 35 others.
* **Optimization:** The model's weights (`.pth`) are loaded directly into RAM at server startup using `model.eval()`, ensuring inference takes milliseconds rather than seconds.

---

## 💻 Running the Project Locally

If you are a recruiter or developer looking to run the codebase locally:

### Prerequisites
* Python 3.10+
* Node.js v18+

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

## 🚀 Deployment Status
* **Frontend Hosting:** Vercel
* **Backend Hosting:** Render
* **Continuous Integration:** Both services are linked to the `main` branch of this repository for automatic CI/CD deployments on git push.

<div align="center">
  <i>Developed by Yatin - Showcasing Full Stack AI Engineering</i>
</div>
