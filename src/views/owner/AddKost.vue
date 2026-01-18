<template>
  <div class="dashboard-layout">
    <OwnerSidebar />

    <main class="main-content">
      
      <header class="topbar">
        <button class="back-btn" @click="$router.back()">
          <Icon icon="mdi:arrow-left" />
        </button>
        <div class="page-title">
          <h1>Tambah Properti Baru</h1>
          <p>Isi detail kost Anda selengkap mungkin.</p>
        </div>
      </header>

      <div class="content-wrapper">
        <form @submit.prevent="handleSubmit" class="add-form">
          
          <div class="form-section">
            <h2>Foto Utama</h2>
            <div class="image-upload-box" @click="triggerFileInput">
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden-input" 
                accept="image/*"
                @change="handleFileChange"
              />
              
              <img v-if="previewImage" :src="previewImage" class="preview-img" />
              
              <div v-else class="placeholder">
                <Icon icon="mdi:cloud-upload" class="upload-icon" />
                <p>Klik untuk upload foto utama</p>
                <span class="sub-text">Format JPG/PNG, Max 2MB</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Informasi Dasar</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Kost</label>
                <input v-model="form.name" type="text" placeholder="Contoh: Kost Melati Executive" required />
              </div>
              
              <div class="form-group">
                <label>Tipe Kost</label>
                <select v-model="form.type">
                  <option value="campur">Campur (Putra/Putri)</option>
                  <option value="putra">Khusus Putra</option>
                  <option value="putri">Khusus Putri</option>
                </select>
              </div>

              <div class="form-group">
                <label>Harga per Bulan (Rp)</label>
                <input v-model="form.price" type="number" placeholder="Contoh: 1500000" required />
              </div>

              <div class="form-group">
                <label>Total Kamar</label>
                <input v-model="form.total_rooms" type="number" placeholder="Jumlah kamar tersedia" required />
              </div>
            </div>
            
            <div class="form-group mt-3">
              <label>Deskripsi Kost</label>
              <textarea v-model="form.description" rows="4" placeholder="Ceritakan kelebihan kost Anda..."></textarea>
            </div>
          </div>

          <div class="form-section">
            <h2>Lokasi</h2>
            <div class="form-group">
              <label>Alamat Lengkap</label>
              <textarea v-model="form.address" rows="2" placeholder="Jalan, Nomor, Kelurahan, Kecamatan..." required></textarea>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Kecamatan (District)</label>
                <select v-model="form.district">
                  <option value="Denpasar Selatan">Denpasar Selatan</option>
                  <option value="Denpasar Utara">Denpasar Utara</option>
                  <option value="Denpasar Barat">Denpasar Barat</option>
                  <option value="Denpasar Timur">Denpasar Timur</option>
                </select>
              </div>
              <div class="form-group">
                <label>Link Google Maps (Opsional)</label>
                <input v-model="form.maps_link" type="text" placeholder="https://goo.gl/maps/..." />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Fasilitas</h2>
            <p class="section-desc">Pilih fasilitas yang tersedia di kost ini.</p>
            
            <div class="facilities-grid">
              <label 
                v-for="item in facilityOptions" 
                :key="item.id" 
                class="checkbox-card"
                :class="{ 'selected': form.facilities.includes(item.id) }"
              >
                <input 
                  type="checkbox" 
                  :value="item.id" 
                  v-model="form.facilities" 
                  hidden
                />
                <Icon :icon="item.icon" class="fac-icon" />
                <span>{{ item.name }}</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$router.back()">Batal</button>
            <button type="submit" class="btn-save" :disabled="isLoading">
              <Icon v-if="isLoading" icon="mdi:loading" class="spin" />
              {{ isLoading ? 'Menyimpan...' : 'Simpan Properti' }}
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router'; // Perbaikan import
import { Icon } from '@iconify/vue';
import OwnerSidebar from '@/components/navigation/OwnerSidebar.vue';

const router = useRouter(); // Inisialisasi router
const isLoading = ref(false);
const fileInput = ref(null);
const previewImage = ref(null);

// Form Data
const form = reactive({
  name: '',
  type: 'campur',
  price: '',
  total_rooms: '',
  description: '',
  address: '',
  district: 'Denpasar Selatan',
  maps_link: '',
  facilities: [], // Array ID fasilitas
  image: null // File object
});

// Pilihan Fasilitas (Dummy dulu)
const facilityOptions = [
  { id: 1, name: 'WiFi', icon: 'mdi:wifi' },
  { id: 2, name: 'AC', icon: 'mdi:air-conditioner' },
  { id: 3, name: 'K. Mandi Dalam', icon: 'mdi:toilet' },
  { id: 4, name: 'Kasur', icon: 'mdi:bed' },
  { id: 5, name: 'Lemari', icon: 'mdi:wardrobe' },
  { id: 6, name: 'Parkir Motor', icon: 'mdi:motorbike' },
  { id: 7, name: 'Parkir Mobil', icon: 'mdi:car' },
  { id: 8, name: 'Dapur Umum', icon: 'mdi:chef-hat' },
];

// Handle File
const triggerFileInput = () => fileInput.value.click();

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.image = file;
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => previewImage.value = e.target.result;
    reader.readAsDataURL(file);
  }
};

// Handle Submit (Simulasi Dulu)
const handleSubmit = async () => {
  isLoading.value = true;

  // Simulasi loading 1.5 detik
  setTimeout(() => {
    isLoading.value = false;
    alert('Simulasi: Kost Berhasil Ditambahkan!');
    console.log("Data yang dikirim:", form);
    
    // Redirect kembali ke halaman list
    router.push('/owner/properties');
  }, 1500);
};
</script>

<style scoped>
/* Layout dasar sama */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
}
.main-content { flex: 1; margin-left: 260px; }
.content-wrapper { padding: 30px; max-width: 900px; margin: 0 auto; }

/* Topbar */
.topbar {
  background: white;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #edf2f7;
}
.back-btn {
  background: none; border: 1px solid #e2e8f0; border-radius: 50%; width: 40px; height: 40px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  color: #4a5568; transition: all 0.2s;
}
.back-btn:hover { background: #cbd5e0; }
.page-title h1 { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin: 0; }
.page-title p { color: #718096; font-size: 0.9rem; margin: 0; }

/* FORM STYLES */
.add-form { display: flex; flex-direction: column; gap: 30px; }

.form-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.form-section h2 { font-size: 1.1rem; font-weight: 700; color: #2d3748; margin-bottom: 20px; border-bottom: 2px solid #f7fafc; padding-bottom: 10px; display: inline-block; }

/* Image Upload */
.image-upload-box {
  width: 100%;
  height: 250px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f7fafc;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}
.image-upload-box:hover { border-color: #fca311; background: #fffaf0; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.placeholder { text-align: center; color: #718096; }
.upload-icon { font-size: 3rem; color: #cbd5e0; margin-bottom: 10px; }
.sub-text { font-size: 0.8rem; color: #a0aec0; display: block; margin-top: 5px; }
.hidden-input { display: none; }

/* Inputs */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
.mt-3 { margin-top: 15px; }

label { font-size: 0.9rem; font-weight: 600; color: #4a5568; }
input, select, textarea {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  font-family: inherit;
  transition: border 0.2s;
}
input:focus, select:focus, textarea:focus { border-color: #fca311; }

/* Facilities Checkbox Grid */
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}
.checkbox-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.checkbox-card:hover { border-color: #fca311; }
.checkbox-card.selected { background: #fffaf0; border-color: #fca311; color: #d97706; }
.fac-icon { font-size: 1.5rem; }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
.btn-cancel {
  padding: 12px 25px; background: white; border: 1px solid #e2e8f0; border-radius: 8px;
  font-weight: 600; color: #718096; cursor: pointer;
}
.btn-save {
  padding: 12px 30px; background: #1f3a52; border: none; border-radius: 8px;
  font-weight: 600; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px;
}
.btn-save:hover { background: #2c5274; }
.btn-save:disabled { background: #94a3b8; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }

@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>