# 🌿 Design Sistem Machine Learning - Dermalyze: Skin Type Classification

## 📁 Pemahaman Data

Dataset digunakan merupakah hasil buatan pribadi dengan mengumpulkan dari beberapa dari sumber berikut: 
1. https://www.kaggle.com/datasets/rajeshpandhare/skin-classification-normal-acne-oily-dry-wrinkle
2. https://www.kaggle.com/datasets/kepinn69/new-dataset-skinai
3. https://www.kaggle.com/datasets/shakyadissanayake/oily-dry-and-normal-skin-types-dataset
4. https://www.kaggle.com/datasets/ritikasinghkatoch/normaldryoily-skin-type
5. https://www.kaggle.com/datasets/shakyadissanayake/oily-dry-and-normal-skin-types-dataset 

Dataset terdiri dari data tiga jenis tipe kulit yang berbeda yaitu oily, dry dan normal yang terdiri dari :
1. Oily 104 gambar
2. Dry 100 gambar
3. Normal 86 gambar

### 📊 EDA dan Visualisasi Data
EDA dilakukan untuk melihat informasi disertai visualisasi terkait dataset seperti bentuk dan tampilan data, serta distribusi data. Berdasarkan tahapan EDA didapatkan informasi:
- Setiap gambar tidak terbatas kelas memiliki resolusi yang berbeda - beda.
- Jumlah gambar setiap kelas tidak seimbang. Sehingga diperlukan proses oversampling untuk menyeimbangkan jumlah masing masing kelas.
- Diperlukan resize dan augmentasi yang lebih untuk menampilkan tekstur dari masing - masing tipe kulit agar model dapat mengenali pola dengan lebih baik serta menghindari bias selama pelatihan.

## Data Preprosesing
Pada tahap ini, dilakukan beberapa langkah penting untuk menyiapkan dataset sebelum dimasukkan ke dalam model CNN. Tiga tahap utama yang dilakukan yaitu oversampling, split dataset menjadi data pelatihan dan validasi, serta image generator - augmentasi.

1. Over sampling

 Oversampling dilakukan untuk menyamakan jumlah gambar di setiap kelas. Dalam konteks ini, setiap kelas ditargetkan memiliki 300 gambar. Teknik ini sangat  penting untuk mencegah model bias terhadap kelas dengan jumlah data terbanyak, dan memastikan model dapat belajar secara adil dari semua kelas.
 
 Langkah-langkah yang dilakukan:
 - Menyalin seluruh gambar asli dari direktori EXTRACTED_PATH ke direktori AUGMENTED_PATH.
 - Jika jumlah gambar asli dalam suatu kelas < 300, maka dilakukan augmentasi sederhana, yaitu dengan Gaussian Blur.
 - Gambar hasil augmentasi disimpan dengan nama os_{i}.jpg.
 
  ```python
 AUGMENTED_PATH = '/content/Dataset_Skin_Type/overSampling_dataset'
 IMAGES_PER_CLASS = 300
 TARGET_SIZE = (224, 224)
 
 def get_class_transformations(cls):
     return [lambda img: cv2.GaussianBlur(img, (3, 3), 0)]
 
 def oversample_class(cls, src, dst, images, total_original, target_count=IMAGES_PER_CLASS):
     ...
     for i in tqdm(range(target_count - total_original), desc=f"Oversampling {cls}"):
         ...
         transform = random.choice(transformation_pool)
         img_rgb = transform(img_rgb)
         ...
 def augment_and_oversample():
   ...
  ```

2. Split Data

 Setelah oversampling selesai, seluruh data dibagi menjadi dua bagian:
 - 80% untuk data pelatihan (train)
 - 20% untuk data validasi (validation)
 
 Pembagian dilakukan secara acak namun tetap mempertahankan distribusi kelas dengan adil. Data hasil pembagian disimpan dalam direktori split_dataset.
 
  ```python
 SPLIT_PATH = '/content/Dataset_Skin_Type/split_dataset'
 TRAIN_SPLIT = os.path.join(SPLIT_PATH, 'train')
 VALID_SPLIT = os.path.join(SPLIT_PATH, 'validation')
 
 val_ratio = 0.2
 
 for cls in classes:
     ...
     train_files, valid_files = train_test_split(all_files, test_size=val_ratio, random_state=42, shuffle=True)
     ...
 
  ```
3. Image Data Generator - Augmentasi

  Pada tahap ini, dilakukan proses augmentasi data menggunakan generator khusus bernama RGBGrayGenerator, yang merupakan custom data generator berbasis Keras Sequence. Tujuan utama dari pendekatan ini adalah untuk menggabungkan informasi warna (RGB) dan tekstur pencahayaan (Grayscale) dari gambar kulit dalam satu format input, sehingga model CNN dapat belajar dari dua aspek penting dalam klasifikasi tipe kulit: warna dan tekstur.
  
  Pada umumnya, model CNN hanya menerima input gambar berformat RGB (3-channel). Namun, dalam konteks klasifikasi jenis kulit ini, informasi visual dari tekstur seperti kerutan, pori-pori, garis halus, dan ketidakteraturan permukaan kulit sering kali lebih penting dibanding warna semata.
  
  Dengan menggabungkan channel grayscale ke dalam input gambar, model memperoleh kontras dan perbedaan intensitas piksel yang lebih tajam, yang membantu meningkatkan akurasi dalam membedakan pola-pola halus antar jenis kulit.
  
  ![rgb_scale](https://github.com/user-attachments/assets/9b559474-8a23-4d87-b5f1-8f43c11065b3)
  
  **Cara Kerja Generator**
  
  RGBGrayGenerator bekerja dalam beberapa langkah:
  - Membaca direktori dataset (train/validation) dan memuat semua gambar per kelas.
  - Setiap gambar diubah dari BGR ke RGB.
  - Gambar RGB dikonversi menjadi Grayscale.
  - Channel grayscale kemudian ditambahkan sebagai channel keempat pada gambar.
  - Gambar dikonversi menjadi array berukuran (height, width, 4) dan dinormalisasi ke rentang [0, 1].
  - Label dikonversi menjadi one-hot encoding.
  
  **Informasi yang akan didapat Model**
  
  | Kanal     | Deskripsi                                                |
  | --------- | -------------------------------------------------------- |
  | RGB       | Informasi warna dan pigmentasi kulit                     |
  | Grayscale | Menyoroti tekstur: kerutan, pori-pori, anomali permukaan |
  
  
  Dengan gabungan ini, CNN akan memiliki pemahaman visual yang lebih kaya dan mendalam, sehingga lebih mampu membedakan antar tipe kulit yang mirip dari segi warna, tetapi berbeda dari segi tekstur.
  
  
   ```python
  train_generator = RGBGrayGenerator(train_dir, batch_size=32, target_size=(224, 224))
  validation_generator = RGBGrayGenerator(val_dir, batch_size=32, target_size=(224, 224), shuffle_data=False)
  
   ```
  Di sini, train_generator dan validation_generator akan menyediakan batch berukuran (batch_size, 224, 224, 4) yang sudah siap digunakan dalam proses pelatihan CNN.

## 🧠 Model


**Algoritma yang digunakan**

1. **Convolutional Neural Network (CNN)**

    Convolutional Neural Network (CNN) adalah jenis algoritma deep learning yang dirancang khusus untuk pemrosesan data berbentuk gambar. CNN bekerja dengan mengekstraksi fitur spasial dari gambar, seperti tepi, pola, dan tekstur, melalui proses konvolusi dan pooling. CNN sangat efektif untuk tugas klasifikasi citra karena dapat mengenali pola visual meskipun terjadi pergeseran, rotasi, atau perubahan pencahayaan pada gambar.

    Model CNN yang digunakan dibangun dengan pendekatan sequential dan terdiri dari beberapa lapisan utama:

    | Layer             | Detail                                                                              |
    | ----------------- | ----------------------------------------------------------------------------------- |
    | **Input**         | Ukuran gambar `(224, 224, 4)`, terdiri dari RGB (3 channel) + Grayscale (1 channel) |
    | **Conv2D #1**     | 32 filter, kernel 3x3, aktivasi ReLU                                                |
    | **Dropout #1**    | Tingkat dropout 20% untuk mencegah overfitting                                      |
    | **MaxPooling #1** | Pooling 2x2 untuk menurunkan dimensi feature map                                    |
    | **Conv2D #2**     | 64 filter, kernel 3x3, aktivasi ReLU                                                |
    | **Dropout #2**    | Dropout 30%                                                                         |
    | **MaxPooling #2** | Pooling 2x2                                                                         |
    | **Conv2D #3**     | 128 filter, kernel 3x3, aktivasi ReLU                                               |
    | **Dropout #3**    | Dropout 40%                                                                         |
    | **MaxPooling #3** | Pooling 2x2                                                                         |
    | **Flatten**       | Mengubah hasil konvolusi menjadi vektor 1D                                          |
    | **Dense #1**      | 256 neuron, aktivasi ReLU                                                           |
    | **Dropout #4**    | Dropout 50%                                                                         |
    | **Output Layer**  | 3 neuron (jumlah kelas kulit), aktivasi Softmax untuk klasifikasi multiclass        |
 

    **Proses Detail**

    1. Preprocessing Input
    
       Input gambar berukuran `(224, 224, 4)` adalah hasil penggabungan channel RGB dan grayscale melalui custom generator `RGBGrayGenerator`. Tujuannya untuk meningkatkan akurasi dengan mempertimbangkan informasi warna dan tekstur kulit.
 
       ```python
       Conv2D(32, (3, 3), input_shape=(224, 224, 4)),
       ```

    2. Penanganan Imbalance Data
       Dataset memiliki distribusi jumlah gambar yang tidak seimbang antar kelas. Untuk mengatasi hal ini, digunakan pendekatan `class_weight` dari Scikit-Learn. Weight ini akan diberikan saat pelatihan untuk menyeimbangkan kontribusi tiap kelas.
 
       ```python
       from sklearn.utils.class_weight import compute_class_weight
       labels = train_generator.classes
       unique_classes = np.unique(labels)
       class_weights = compute_class_weight(class_weight='balanced', classes=unique_classes, y=labels)
       class_weight_dict = dict(zip(unique_classes, class_weights))
       ```
    3. Kompilasi
       Model dikompilasi dengan konfigurasi:
       - Optimizer: Adam dengan learning_rate=1e-3
       - Loss Function: categorical_crossentropy
       - Metrics: accuracy

    4. Early Stopping
       Untuk mencegah overfitting, digunakan teknik early stopping dengan memantau val_loss. Jika tidak ada perbaikan selama 5 epoch berturut-turut, maka training akan dihentikan dan bobot terbaik digunakan.
 
       ```python
       early_stop = EarlyStopping(
           monitor='val_loss',
           patience=5,
           restore_best_weights=True
       )
       ```
    5. Proses Pelatihan
       Model dilatih menggunakan data dari train_generator dan divalidasi menggunakan validation_generator dengan:
 
       ```python
       history = model.fit(
           train_generator,
           validation_data=validation_generator,
           epochs=30,
           callbacks=[early_stop],
           class_weight=class_weight_dict
       )
       ```

## Evaluasi

Pada tahap ini, evaluasi model dilakukan untuk memahami seberapa baik kinerja model klasifikasi dalam memprediksi data baru. Evaluasi model dilakukan dengan menggunakan metrik-metrik evaluasi klasifikasi berikut:

- **Accuracy**: Akurasi adalah proporsi jumlah prediksi yang benar (positif dan negatif) dibandingkan dengan total prediksi. Cocok digunakan ketika distribusi kelas seimbang.
  Formula:  
  ![Accuracy](https://github.com/user-attachments/assets/4f0bdd4a-12db-4cde-862c-65d5cccf8ea9)

- **Precision**: Presisi mengukur seberapa akurat prediksi positif dari model. Artinya, dari semua yang diprediksi sebagai positif, berapa banyak yang benar-benar positif. Cocok ketika false positive lebih berdampak besar, misalnya pada diagnosa penyakit.
  Formula:  
  ![Precision](https://github.com/user-attachments/assets/4d1e0bf6-cf26-4286-a4cb-b1bf476ba0e5)

- **Recall**: Recall menunjukkan seberapa banyak dari kasus positif yang berhasil dideteksi dengan benar oleh model. Cocok ketika false negative berbahaya, seperti gagal mendeteksi pasien sakit.
  Formula:  
  ![Recall](https://github.com/user-attachments/assets/8bfb5177-b2b0-41da-8e0d-c42c773dfa04)

- **F1-Score**: F1-Score adalah rata-rata harmonik dari Precision dan Recall. Digunakan saat membutuhkan keseimbangan antara presisi dan recall
  Formula:  
  ![F1-Score](https://github.com/user-attachments/assets/7a8a4a0e-64de-464e-a8ea-9981bb315b58)

  Keterangan:
    - TP = True Positive (prediksi positif yang benar)
    = TN = True Negative (prediksi negatif yang benar)
    - FP = False Positive (prediksi positif yang salah)
    - FN = False Negative (prediksi negatif yang salah)


### Kenapa Menggunakan Metrik Evaluasi ?
Dalam proyek klasifikasi jenis kulit seperti Dermalyze, penggunaan metrik evaluasi sangat penting untuk menilai performa model secara menyeluruh dan tidak hanya bergantung pada akurasi saja. Hal ini dikarenakan model harus mampu mengenali setiap jenis kulit (Oily, Dry, Normal) dengan akurat dan adil, terutama saat data awal memiliki distribusi yang tidak seimbang.

Berikut adalah alasan spesifik pemilihan metrik:

- Akurasi memberikan gambaran umum seberapa baik model secara keseluruhan. Namun, jika satu kelas dominan (misal: kulit berminyak lebih banyak dari lainnya), akurasi tinggi bisa menyesatkan.

- Precision penting ketika kita ingin menghindari kesalahan pengklasifikasian. Misalnya, jika model salah memprediksi kulit normal sebagai berminyak, bisa menyebabkan pengguna menggunakan produk yang salah, yang justru memperburuk kondisi kulit.

- Recall sangat krusial untuk mendeteksi semua kasus dari suatu tipe kulit. Misalnya, jika banyak kulit kering tidak dikenali, maka banyak kasus bisa terabaikan.

- F1-Score dipilih karena mampu memberikan keseimbangan antara Precision dan Recall. Ini sangat sesuai untuk klasifikasi jenis kulit yang memerlukan keakuratan tinggi dan sensitivitas yang baik terhadap masing-masing kelas, terutama ketika distribusi data tidak seimbang.

Dengan kombinasi metrik tersebut, evaluasi model menjadi lebih komprehensif, berimbang, dan relevan dengan tujuan akhir dari sistem, yaitu merekomendasikan perawatan kulit yang sesuai berdasarkan jenis kulit pengguna.


**Hasil Evaluasi Model**
- Akurasi
  
  | Dataset    | Akurasi   |
  |------------|-----------|
  | Pelatihan  | 99.58%    |
  | Validasi   | 98.33%    |
  | Pengujian  | 98.33%    |

- Grafik akurasi
  
  ![grafik_akurasi](https://github.com/user-attachments/assets/72de68c3-8fa3-42eb-bf73-f7803268794b)

- grafik loss
  
  ![grafik_loss](https://github.com/user-attachments/assets/edc69b7c-d4cd-4845-a67f-de29bf6e6114)

- Classification Report

  | Kelas              | Precision | Recall | F1-Score | Support |
  |--------------------|-----------|--------|----------|---------|
  | Dry                | 0.98      | 1.00   | 0.99     | 60      |
  | Normal             | 0.97      | 1.00   | 0.98     | 60      |
  | Oily               | 1.00      | 0.95   | 0.97     | 60      |
  | **Akurasi**        |           |        | **0.98** | 180     |
  | **Rata-rata Macro**| 0.98      | 0.98   | 0.98     | 180     |
  | **Rata-rata Weighted** | 0.98  | 0.98   | 0.98     | 180     |


- Confussion matrik
  
  ![confussion_matrik](https://github.com/user-attachments/assets/fa22d81d-f4a1-4d9d-81a3-8de84fd565ae)

**Intepretasi**
- Akurasi tinggi secara konsisten menunjukkan proses pelatihan yang sukses dan minim overfitting.
- Loss menurun drastis pada awal pelatihan dan stabil di bawah 0.1. Model berhasil mengurangi error dengan efisien, tanpa gejala underfitting maupun overfitting.
- Nilai precision, recall, dan F1-score tinggi dan merata di semua kelas. Recall kelas “Oily” sedikit lebih rendah, tetapi masih dalam rentang akurat.
