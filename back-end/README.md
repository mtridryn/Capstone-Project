# Dermalyze Backend

Ini adalah backend untuk web **Dermalyze**, yang menggunakan:

- Express.js (REST API)
- Flask (Model ML untuk prediksi)
- PocketBase (sebagai database)

## 📂 Struktur Folder

backend/

│

├── api-backend/ # Backend utama (Express.js, pocketbase)

├── api-model/ # API model ML (Flask)

## 🚀 Cara Menjalankan

### 1. Jalankan Express.js (Port: 3000)

cd api-backend

npm install

node index.js

### 2. Jalankan Flask (Model ML Port: 5001)

https://drive.google.com/drive/folders/1LeuJCdHrSA-SZGyweltCfCecvNKhQsFV?usp=sharing

download model yang ada di drive lalu masukkan ke backend/api-model/model

cd api-model

pip install flask flask-cors tensorflow opencv-python scikit-image numpy

python app.py

### 3.Jalankan PocketBase (Port: 8090)

download & install pocketbase

cd /pocketbase

pocketbase.exe serve

http://localhost:8090/\_/

create collection users, hasil_analisis, product

## 🔗 Endpoint API (localhost:3000)

Auth

POST /api/register — Registrasi pengguna

POST /api/login — Login pengguna

POST /api/logout — Logout

Produk
GET /api/products — Semua produk

GET /api/products?skintype=...&notable_effects=...&product_type=... — Filter produk

GET /api/products?min_price=...&max_price=... — Filter harga

Prediksi & Riwayat
POST /api/predict — Prediksi jenis kulit via Flask

GET /api/history — Riwayat pengguna

POST /api/add-poin — Tambah poin pengguna

## 📄 Catatan

Jalankan ketiga server (Express, Flask, dan PocketBase) secara bersamaan untuk fungsionalitas penuh.

## 🔐 Akses Lokal

Express: http://localhost:3000

Flask: http://localhost:5001/predict

PocketBase: http://localhost:8090/\_/
