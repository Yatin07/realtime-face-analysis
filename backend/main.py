import io
import torch
import torch.nn as nn
from PIL import Image
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import time  # NEW: Import Python's built-in time tracker

# ... rest of your imports
import cv2                        # NEW: OpenCV for image math
import mediapipe as mp            # NEW: Google's Face Detector


# ==========================================
# 1. DEFINE YOUR MODEL ARCHITECTURE
# ==========================================
def conv_block(in_channels, out_channels):
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(out_channels),
        nn.ReLU(inplace=True),
        nn.MaxPool2d(kernel_size=2, stride=2)
    )

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=40, dropout=0.4):
        super().__init__()
        self.block1 = conv_block(3, 64)
        self.block2 = conv_block(64, 128)
        self.block3 = conv_block(128, 256)
        self.block4 = conv_block(256, 256)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(p=dropout)
        self.fc = nn.Linear(256, num_classes)
    
    def forward(self, x):
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        x = self.fc(x)
        return x

ATTRIBUTE_NAMES = [
    '5_o_Clock_Shadow', 'Arched_Eyebrows', 'Attractive', 'Bags_Under_Eyes',
    'Bald', 'Bangs', 'Big_Lips', 'Big_Nose', 'Black_Hair', 'Blond_Hair',
    'Blurry', 'Brown_Hair', 'Bushy_Eyebrows', 'Chubby', 'Double_Chin',
    'Eyeglasses', 'Goatee', 'Gray_Hair', 'Heavy_Makeup', 'High_Cheekbones',
    'Male', 'Mouth_Slightly_Open', 'Mustache', 'Narrow_Eyes', 'No_Beard',
    'Oval_Face', 'Pale_Skin', 'Pointy_Nose', 'Receding_Hairline',
    'Rosy_Cheeks', 'Sideburns', 'Smiling', 'Straight_Hair', 'Wavy_Hair',
    'Wearing_Earrings', 'Wearing_Hat', 'Wearing_Lipstick', 'Wearing_Necklace',
    'Wearing_Necktie', 'Young'
]

# ==========================================
# 2. INITIALIZE SERVER & LOAD MODEL
# ==========================================
app = FastAPI(title="Face Attribute API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Detect CPU or GPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Loading Model to {device}...")

# Load Model
model = SimpleCNN(num_classes=40).to(device)
model_path = "best_model_gpu.pth"
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval() # Set to evaluation mode!
print("Model Loaded Successfully!")

# ==========================================
# NEW: INITIALIZE MEDIAPIPE FACE DETECTOR
# ==========================================
print("Loading MediaPipe Face Detector...")
mp_face_detection = mp.solutions.face_detection
# min_detection_confidence=0.5 means it must be 50% sure it sees a face
face_detector = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)


# ==========================================
# 3. PREDICT ENDPOINT
# ==========================================
@app.post("/analyze")
async def analyze_face(file: UploadFile = File(...)):
    # Read the raw image bytes sent from React
    image_bytes = await file.read()
    
    # 1. Open the image using Pillow (PIL)
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
    # ==========================================
    # NEW: AI PIPELINE STEP 1 - FACE DETECTION
    # ==========================================
    # Convert PIL Image to a Numpy Array for MediaPipe
    img_np = np.array(img)
    
    # Run the ultra-fast face detector
    results_mp = face_detector.process(img_np)
    
    # If it found a face, let's crop it dynamically!
    if results_mp.detections:
        # Get the first face it found
        detection = results_mp.detections[0]
        bboxC = detection.location_data.relative_bounding_box
        img_height, img_width, _ = img_np.shape
        
        # Calculate the exact pixel coordinates of the tight box
        x = int(bboxC.xmin * img_width)
        y = int(bboxC.ymin * img_height)
        w = int(bboxC.width * img_width)
        h = int(bboxC.height * img_height)
        
        # Calculate our dynamic margins (to include hair, hats, and double chins!)
        margin_x = int(w * 0.25)       # 25% on Left and Right
        margin_top = int(h * 0.35)     # 35% on Top (Hair)
        margin_bottom = int(h * 0.25)  # 25% on Bottom (Neck)
        
        # Apply the margins safely (making sure we don't crop outside the image border)
        x_new = max(0, x - margin_x)
        y_new = max(0, y - margin_top)
        w_new = min(img_width - x_new, w + margin_x * 2)
        h_new = min(img_height - y_new, h + margin_top + margin_bottom)
        
        # Actually perform the crop on the original image!
        img = img.crop((x_new, y_new, x_new + w_new, y_new + h_new))
        
    # ==========================================
    # AI PIPELINE STEP 2 - CNN PREDICTION
    # ==========================================
    # Now that 'img' is perfectly cropped, we pass it to PyTorch just like before!
    img_resized = img.resize((160, 160), Image.BILINEAR)
    arr = np.array(img_resized, dtype=np.float32) / 255.0
    tensor = torch.from_numpy(arr).permute(2, 0, 1) # Change shape to [Channels, H, W]
    tensor = (tensor - 0.5) / 0.5 # Normalize to [-1, 1]
    tensor = tensor.unsqueeze(0).to(device) # Add batch dimension
    
    # Start the stopwatch!
    start_time = time.time()
    
    # Run the model!
    with torch.no_grad():
        outputs = model(tensor)

    # 4. Convert raw math outputs into percentages using Sigmoid
    probs = torch.sigmoid(outputs).float().cpu().numpy()[0]
    
    # 5. Create the clean list of results
    results = []
    for i, attr in enumerate(ATTRIBUTE_NAMES):
        results.append({
            "name": attr.replace('_', ' '),
            "confidence": round(float(probs[i]) * 100, 1)
        })
        
    results_sorted = sorted(results, key=lambda x: x['confidence'], reverse=True)
    
    # 6. Format the final response
    end_time = time.time()
    inference_ms = round((end_time - start_time) * 1000)
    
    return {
        "results": results_sorted,
        "inference_time": f"{inference_ms} ms"
    }



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
