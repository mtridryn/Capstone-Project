from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import skimage.feature

app = Flask(__name__)
CORS(app)

# === Konfigurasi Model dan Threshold ===
MODEL_PATH = 'model/skin_type_model.h5'
IMG_SIZE = (224, 224)
LABELS = ['dry', 'normal', 'oily']
SKIN_AREA_THRESHOLD = 0.05         # Minimal 5% area harus kulit
LBP_TEXTURE_THRESHOLD = 0.08       # Diturunkan dari 0.15 ke 0.08

# === Load Model ===
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# === Fungsi Deteksi Kulit ===
def contains_skin(img):
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    mask_ycrcb = cv2.inRange(ycrcb, (0, 133, 77), (255, 173, 127))
    mask_hsv = cv2.inRange(hsv, (0, 40, 0), (25, 255, 255))
    mask = cv2.bitwise_and(mask_ycrcb, mask_hsv)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=3)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return False

    largest_contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest_contour)
    total_area = img.shape[0] * img.shape[1]
    skin_ratio = area / total_area

    print(f"Skin largest contour ratio: {skin_ratio:.4f}")
    return skin_ratio > SKIN_AREA_THRESHOLD

# === Fungsi Cek Tekstur Kulit (LBP) ===
def check_skin_texture(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lbp = skimage.feature.local_binary_pattern(gray, P=8, R=1, method="uniform")
    hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, 11), range=(0, 10), density=True)
    score = hist[1] + hist[2] + hist[3]

    print(f"LBP skin texture score: {score:.4f}")
    return score > LBP_TEXTURE_THRESHOLD

# === Preprocessing untuk Gambar 4 Channel ===
def preprocess_image_4ch_from_array(img, target_size=(224, 224)):
    img = cv2.resize(img, target_size)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    gray = np.expand_dims(gray, axis=-1)
    combined = np.concatenate((rgb, gray), axis=-1) / 255.0
    return np.expand_dims(combined, axis=0), rgb

# === Preprocessing Upload ===
def preprocess(file_stream):
    file_bytes = np.frombuffer(file_stream.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    return img

# === API Endpoint ===
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    try:
        img = preprocess(file.stream)

        if not contains_skin(img):
            return jsonify({'label': 'unknown', 'confidence': 0.0})

        if not check_skin_texture(img):
            return jsonify({'label': 'unknown', 'confidence': 0.0})

        x, _ = preprocess_image_4ch_from_array(img, target_size=IMG_SIZE)
        pred = model.predict(x)[0]
        idx = int(np.argmax(pred))
        confidence = float(pred[idx])

        return jsonify({
            'label': LABELS[idx],
            'confidence': confidence
        })

    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({'error': 'Failed to get prediction', 'details': str(e)}), 500

# === Jalankan Server ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
