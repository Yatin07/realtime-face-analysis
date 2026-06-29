# 🤖 Real-Time AI Face Scanner

A high-performance, real-Time Artificial Intelligence pipeline that instantly scans a webcam feed and predicts 40 distinct facial attributes (like "Wearing Hat", "Smiling", "Wavy Hair") using a custom-trained PyTorch Convolutional Neural Network.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)

## 🧠 How It Works (The Multi-AI Pipeline)
Raw webcam photos contain too much background noise (shoulders, walls, shirts) which destroys CNN accuracy. To solve this, the backend uses a two-stage decoupled AI pipeline:

1. **Stage 1 (Pre-Processing):** Google's `MediaPipe` instantly scans the frame to detect facial coordinates. We apply a mathematical "Dynamic Margin" (+35% top, +25% sides) to crop the image. This perfectly captures hair, hats, and necklines while eliminating background noise.
2. **Stage 2 (Inference):** The perfectly cropped 160x160 tensor is passed into our custom PyTorch CNN (trained on the CelebA Dataset of 200,000+ images), which outputs confidence scores for 40 attributes in milliseconds.

## 🚀 Tech Stack
* **Frontend:** React (Vite), React Router (SPA Architecture), Tailwind CSS, React-Webcam
* **Backend:** Python, FastAPI, Uvicorn (Asynchronous Server)
* **Machine Learning:** PyTorch (CNN), MediaPipe (Face Detection), OpenCV (Image Mathematics)

## 💻 How to Run Locally

### 1. Start the AI Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
