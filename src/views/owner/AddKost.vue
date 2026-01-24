<template>
  <div class="add-kost-page">
    <div class="container">
      
      <div class="page-header">
        <div>
          <h1 class="title">Tambah Properti Baru</h1>
          <p class="subtitle">Lengkapi data kost Anda agar bisa diverifikasi Admin.</p>
        </div>
        <button class="btn-back" @click="$router.back()">
          <Icon icon="mdi:arrow-left" /> Batal
        </button>
      </div>

      <div v-if="errorMessage" class="alert-error">
        <Icon icon="mdi:alert-circle" /> {{ errorMessage }}
      </div>

      <div class="form-wrapper">
        <form @submit.prevent="handleSubmit">

          <div class="form-section">
            <h3 class="section-title">
              <Icon icon="mdi:home-city-outline" class="icon" /> Data Umum
            </h3>
            
            <div class="form-group">
              <label>Nama Kost <span class="required">*</span></label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Contoh: Kost Griya Denpasar" 
                required 
              />
            </div>

            <div class="form-group">
              <label>Deskripsi <span class="required">*</span></label>
              <textarea 
                v-model="form.description" 
                rows="4" 
                placeholder="Jelaskan fasilitas umum, lingkungan sekitar, dll..." 
                required
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <Icon icon="mdi:map-marker-radius" class="icon" /> Lokasi
            </h3>

            <div class="grid-2">
              <div class="form-group">
                <label>Kecamatan <span class="required">*</span></label>
                <select v-model="form.district" required>
                  <option value="" disabled>Pilih Kecamatan</option>
                  <option value="Denpasar Barat">Denpasar Barat</option>
                  <option value="Denpasar Timur">Denpasar Timur</option>
                  <option value="Denpasar Utara">Denpasar Utara</option>
                  <option value="Denpasar Selatan">Denpasar Selatan</option>
                </select>
              </div>

              <div class="form-group">
                <label>Desa/Kelurahan <span class="required">*</span></label>
                <input v-model="form.village" type="text" placeholder="Contoh: Sesetan" required />
              </div>
            </div>

            <div class="form-group">
              <label>Alamat Lengkap <span class="required">*</span></label>
              <textarea v-model="form.address" rows="2" placeholder="Jalan, No Rumah, Gang..." required></textarea>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Latitude <small>(Sementara isi manual/default)</small></label>
                <input v-model="form.latitude" type="text" placeholder="-8.670458" required />
              </div>
              <div class="form-group">
                <label>Longitude</label>
                <input v-model="form.longitude" type="text" placeholder="115.212629" required />
              </div>
            </div>
            <div class="map-placeholder">
              <p>📍 Fitur Pin Peta akan ditambahkan di update berikutnya. Gunakan Google Maps untuk salin koordinat sementara.</p>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <Icon icon="mdi:image-area" class="icon" /> Foto Utama (Thumbnail)
            </h3>
            
            <div class="upload-area">
              <div v-if="imagePreview" class="preview-box">
                <img :src="imagePreview" alt="Preview" />
                <button type="button" class="btn-remove" @click="removeImage">
                  <Icon icon="mdi:close" /> Hapus
                </button>
              </div>

              <div v-else class="upload-box" @click="triggerFileInput">
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="handleFileChange" 
                  accept="image/*" 
                  class="hidden-input" 
                />
                <div class="upload-placeholder">
                  <Icon icon="mdi:cloud-upload" width="40" class="upload-icon" />
                  <span>Klik untuk upload thumbnail kost</span>
                  <small>Format: JPG, PNG (Max 2MB)</small>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$router.back()">Batal</button>
            <button type="submit" class="btn-submit" :disabled="loading">
              <Icon v-if="loading" icon="mdi:loading" class="spin" />
              <span v-else>Simpan & Lanjut</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';

const router = useRouter();
const loading = ref(false);
const errorMessage = ref(null);
const fileInput = ref(null);
const imagePreview = ref(null);
const imageFile = ref(null);

// Form Data Sesuai Controller Store
const form = reactive({
  name: '',
  description: '',
  address: '',
  district: '',
  village: '',
  latitude: '-8.670458', // Default Denpasar
  longitude: '115.212629', // Default Denpasar
});

// File Handling
const triggerFileInput = () => fileInput.value.click();

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      alert("Ukuran file terlalu besar (Max 2MB)");
      return;
    }
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

// Submit Handling
const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = null;

  try {
    const formData = new FormData();
    // Append semua data text
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    // Append file jika ada
    if (imageFile.value) {
      formData.append('thumbnail', imageFile.value);
    }

    // Kirim ke API
    const response = await ownerService.createKost(formData);
    
    // Sukses
    if (response.success) {
      const newKostId = response.data.id;
      // Redirect ke halaman manajemen kamar atau list properti
      // Karena backend menyarankan "silakan tambah Tipe Kamar", 
      // idealnya kita redirect ke form tambah kamar dengan membawa ID Kost baru.
      // Tapi untuk sekarang kita balik ke list properti dulu.
      alert("Kost berhasil dibuat! Silakan tambahkan kamar di menu Kelola Properti.");
      router.push({ name: 'owner-properties' });
    }

  } catch (error) {
    console.error("Error submit:", error);
    // Tangkap pesan error validasi dari Laravel
    if (error.response && error.response.data && error.response.data.errors) {
      // Ambil error pertama
      const firstErrorKey = Object.keys(error.response.data.errors)[0];
      errorMessage.value = error.response.data.errors[firstErrorKey][0];
    } else {
      errorMessage.value = "Terjadi kesalahan saat menyimpan data. Cek koneksi.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.add-kost-page { padding: 40px; font-family: 'Poppins', sans-serif; background: #f8fafc; min-height: 100vh; }
.container { max-width: 800px; margin: 0 auto; }

/* HEADER */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.title { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; margin-bottom: 5px; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.btn-back {
  display: flex; align-items: center; gap: 8px;
  background: white; border: 1px solid #e2e8f0; padding: 10px 16px;
  border-radius: 8px; cursor: pointer; font-weight: 600; color: #64748b;
  transition: 0.2s;
}
.btn-back:hover { background: #f1f5f9; color: #1e3a8a; }

/* ALERT */
.alert-error {
  background: #fee2e2; color: #b91c1c; padding: 12px 16px; border-radius: 8px;
  margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-weight: 500;
  border: 1px solid #fecaca;
}

/* FORM STYLE */
.form-wrapper {
  background: white; border-radius: 16px; padding: 40px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
}

.form-section { margin-bottom: 35px; border-bottom: 1px solid #f1f5f9; padding-bottom: 30px; }
.form-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.section-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 1.1rem; font-weight: 700; color: #1e3a8a; margin-bottom: 20px;
}
.section-title .icon { color: #fca311; font-size: 1.3rem; }

/* INPUTS */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: #334155; }
.required { color: #ef4444; }

input[type="text"], select, textarea {
  width: 100%; padding: 12px 16px; border-radius: 10px;
  border: 1px solid #cbd5e1; font-family: inherit; font-size: 0.95rem;
  transition: border-color 0.2s; outline: none; background: #fff;
}
input:focus, select:focus, textarea:focus { border-color: #1e3a8a; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }
textarea { resize: vertical; }

/* MAP PLACEHOLDER */
.map-placeholder {
  background: #eff6ff; border: 1px dashed #bfdbfe; color: #1e40af;
  padding: 15px; border-radius: 8px; font-size: 0.85rem; text-align: center;
}

/* UPLOAD AREA */
.upload-area { margin-top: 10px; }
.hidden-input { display: none; }

.upload-box {
  border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px;
  text-align: center; cursor: pointer; transition: 0.2s; background: #f8fafc;
}
.upload-box:hover { border-color: #1e3a8a; background: #eff6ff; }

.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748b; }
.upload-icon { color: #94a3b8; }

.preview-box {
  position: relative; width: 100%; height: 250px; border-radius: 12px; overflow: hidden;
  border: 1px solid #e2e8f0;
}
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.7); color: white; border: none;
  padding: 6px 12px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; gap: 5px; font-size: 0.8rem;
}
.btn-remove:hover { background: #ef4444; }

/* ACTIONS */
.form-actions {
  display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;
}
.btn-cancel {
  background: white; border: 1px solid #e2e8f0; color: #64748b;
  padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer;
}
.btn-submit {
  background: #1e3a8a; color: white; border: none;
  padding: 12px 30px; border-radius: 10px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: 0.2s;
}
.btn-submit:hover { background: #172554; }
.btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>