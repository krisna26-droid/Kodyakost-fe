<template>
  <div class="add-kost-page">
    <div class="container">
      <div class="page-header">
        <div class="header-text">
          <h1 class="title">Pasang Iklan Kost</h1>
          <p class="subtitle">Lengkapi data properti untuk mempercepat proses verifikasi.</p>
        </div>
        <button class="btn-back" @click="$router.back()">
          <Icon icon="mdi:arrow-left" /> Kembali
        </button>
      </div>

      <div class="form-wrapper">
        <form @submit.prevent="handleSubmit">
          
          <div class="form-section">
            <h3 class="section-title">
              <div class="icon-circle"><Icon icon="mdi:home-city" /></div>
              Detail Properti
            </h3>
            
            <div class="form-group">
              <label>Nama Kost <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="Contoh: Kost Eksklusif Renon" required />
            </div>

            <div class="form-group">
              <label>Deskripsi Kost <span class="required">*</span></label>
              <textarea v-model="form.description" rows="5" placeholder="Jelaskan keunikan, akses jalan, dan lingkungan sekitar kost Anda..." required></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <div class="icon-circle"><Icon icon="mdi:map-marker-radius" /></div>
              Lokasi & Alamat
            </h3>
            
            <div class="grid-2">
              <div class="form-group">
                <label>Kecamatan <span class="required">*</span></label>
                <select v-model="form.district" @change="handleDistrictChange" required>
                  <option value="" disabled>Pilih Kecamatan</option>
                  <option value="Denpasar Barat">Denpasar Barat</option>
                  <option value="Denpasar Timur">Denpasar Timur</option>
                  <option value="Denpasar Utara">Denpasar Utara</option>
                  <option value="Denpasar Selatan">Denpasar Selatan</option>
                </select>
              </div>
              <div class="form-group">
                <label>Desa/Kelurahan <span class="required">*</span></label>
                <select v-model="form.village" :disabled="!form.district" required>
                  <option value="" disabled>Pilih Desa</option>
                  <option v-for="village in availableVillages" :key="village" :value="village">{{ village }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Alamat Lengkap <span class="required">*</span></label>
              <textarea v-model="form.address" rows="2" placeholder="Nama Jalan, Nomor Bangunan, Gang, Patokan..." required></textarea>
            </div>

            <div class="map-box">
              <label class="inner-label">Tentukan Titik Koordinat (Geser pin ke lokasi tepat kost Anda)</label>
              <div id="map" class="map-container"></div>
              <div class="coord-display">
                <span><b>Lat:</b> {{ form.latitude }}</span>
                <span><b>Lng:</b> {{ form.longitude }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">
              <div class="icon-circle"><Icon icon="mdi:camera" /></div>
              Foto Utama Properti
            </h3>
            
            <div class="photo-upload">
              <label class="inner-label">Foto Cover Kost <span class="required">*</span></label>
              <p class="hint-text">Upload foto terbaik dari tampak depan kost Anda. Format: JPG, PNG. Maksimal 2MB.</p>
              
              <div class="drop-zone" @click="triggerFile" :class="{'has-img': mainPreview}">
                <img v-if="mainPreview" :src="mainPreview" />
                <div v-else class="drop-content">
                  <Icon icon="mdi:image-plus" width="48" />
                  <span>Klik untuk Upload Foto</span>
                </div>
                <input type="file" ref="mainInput" @change="onFileChange" hidden accept="image/*" />
              </div>
            </div>
          </div>

          <div class="info-box">
            <Icon icon="mdi:information-outline" width="24" />
            <div class="info-content">
              <h4>Langkah Selanjutnya</h4>
              <p>Setelah properti kost berhasil dibuat, statusnya adalah <b>Pending</b>. Anda bisa langsung <b>menambahkan Tipe Kamar</b> agar bisa diverifikasi oleh Admin.</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$router.back()">Batalkan</button>
            <button type="submit" class="btn-submit" :disabled="loading">
              <Icon v-if="loading" icon="mdi:loading" class="spin" />
              <span v-else>Simpan & Lanjut Tambah Kamar</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { notify } from '@/utils/swal'; 
import ownerService from '@/services/ownerService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();
const loading = ref(false);

// Data Wilayah Denpasar sesuai Enum DB
const areaData = {
  "Denpasar Selatan": ["Sesetan", "Panjer", "Sidakarya", "Sanur", "Renon", "Pedungan", "Serangan"],
  "Denpasar Barat": ["Dauh Puri", "Pemecutan", "Padangsambian", "Tegal Kertha", "Tegal Harum"],
  "Denpasar Utara": ["Peguyangan", "Ubung", "Pemecutan Kaja", "Tonja", "Dangin Puri Kaja"],
  "Denpasar Timur": ["Kesiman", "Sumerta", "Penatih", "Dangin Puri Klod"]
};

const form = reactive({
  name: '',
  description: '',
  district: '',
  village: '',
  address: '',
  latitude: -8.670458,
  longitude: 115.212629
});

const availableVillages = computed(() => form.district ? areaData[form.district] : []);
const handleDistrictChange = () => { form.village = ''; };

const mainPreview = ref(null);
const mainFile = ref(null);
const mainInput = ref(null);

const triggerFile = () => mainInput.value.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      notify.error("Ukuran file terlalu besar. Maksimal 2MB!");
      return;
    }
    mainFile.value = file;
    mainPreview.value = URL.createObjectURL(file);
  }
};

let map, marker;
onMounted(() => {
  // Setup Leaflet
  map = L.map('map').setView([form.latitude, form.longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  setTimeout(() => map.invalidateSize(), 400);

  marker = L.marker([form.latitude, form.longitude], { draggable: true }).addTo(map);
  
  const updateCoords = (lat, lng) => {
    form.latitude = parseFloat(lat.toFixed(6));
    form.longitude = parseFloat(lng.toFixed(6));
  };

  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    updateCoords(e.latlng.lat, e.latlng.lng);
  });

  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    updateCoords(pos.lat, pos.lng);
  });
});

const handleSubmit = async () => {
  if (!mainFile.value) {
    notify.error("Foto utama kost wajib diunggah!");
    return;
  }

  const confirmed = await notify.confirm(
    "Simpan Properti?",
    "Data kost akan disimpan dengan status Pending. Lanjut untuk mengisi detail kamar?",
    "Ya, Simpan"
  );

  if (!confirmed) return;
  
  loading.value = true;
  try {
    const fd = new FormData();
    // Append data text
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('district', form.district);
    fd.append('village', form.village);
    fd.append('address', form.address);
    fd.append('latitude', form.latitude);
    fd.append('longitude', form.longitude);
    
    // Append File (Key harus 'thumbnail' sesuai KostController)
    fd.append('thumbnail', mainFile.value);

    const res = await ownerService.storeKost(fd);
    
    // Menyesuaikan dengan struktur response return response()->json([...])
    const kostId = res.data?.id;

    if (res.success) {
      await notify.alertSuccess(
        "Kost Berhasil Dibuat!", 
        "Data kost sudah masuk sistem. Sekarang, silakan tambahkan tipe kamar."
      );
      
      // Redirect ke halaman manage-rooms (Pastikan route ini ada)
      router.push({ 
        name: 'owner-rooms', // Sesuaikan nama route Anda
        query: { kost_id: kostId } 
      });
    }
  } catch (error) {
    console.error("❌ Error Simpan Kost:", error);
    const errorMsg = error.response?.data?.message || "Gagal menyimpan data. Silakan coba lagi.";
    notify.error(errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.add-kost-page { padding: 40px 20px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 900px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.title { font-size: 2.2rem; font-weight: 800; color: #1e3a8a; margin: 0; }
.subtitle { color: #64748b; font-size: 1rem; margin-top: 5px; }
.btn-back { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 12px; cursor: pointer; color: #1e3a8a; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.btn-back:hover { background: #1e3a8a; color: white; }

.form-wrapper { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
.form-section { margin-bottom: 45px; }
.section-title { display: flex; align-items: center; gap: 12px; color: #1e3a8a; font-size: 1.3rem; font-weight: 700; margin-bottom: 25px; }
.icon-circle { width: 38px; height: 38px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #1e3a8a; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #334155; font-size: 0.95rem; }
.inner-label { font-weight: 700; color: #1e293b; margin-bottom: 10px; display: block; }
.hint-text { font-size: 0.85rem; color: #94a3b8; margin-bottom: 15px; }
.required { color: #ef4444; }

input, select, textarea { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-family: inherit; transition: 0.2s; outline: none; background: #fcfdfe; font-size: 0.95rem; }
input:focus, select:focus, textarea:focus { border-color: #1e3a8a; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.08); background: white; }

.map-box { margin-top: 25px; }
.map-container { height: 380px; border-radius: 14px; border: 2px solid #e2e8f0; overflow: hidden; }
.coord-display { margin-top: 10px; font-size: 0.85rem; color: #94a3b8; display: flex; gap: 20px; }

.photo-upload { max-width: 500px; margin: 0 auto; }
.drop-zone { height: 280px; border: 2.5px dashed #cbd5e1; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; background: #f8fafc; transition: 0.3s; position: relative; }
.drop-zone:hover { border-color: #1e3a8a; background: #eff6ff; }
.drop-zone.has-img { border-style: solid; border-color: #22c55e; }
.drop-zone img { width: 100%; height: 100%; object-fit: cover; }
.drop-content { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #64748b; }

.info-box { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 20px; display: flex; gap: 15px; margin-bottom: 30px; }
.info-box svg { color: #1e3a8a; flex-shrink: 0; margin-top: 2px; }
.info-content h4 { font-size: 1rem; font-weight: 600; color: #1e3a8a; margin: 0 0 6px 0; }
.info-content p { font-size: 0.9rem; color: #475569; margin: 0; line-height: 1.6; }

.form-actions { display: flex; justify-content: flex-end; gap: 15px; padding-top: 30px; border-top: 1px solid #f1f5f9; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { background: #1e3a8a; color: white; border: none; padding: 12px 35px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 16px rgba(30, 58, 138, 0.25); display: flex; align-items: center; gap: 8px; }
.btn-submit:hover:not(:disabled) { background: #1e40af; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(30, 58, 138, 0.3); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; }
  .form-wrapper { padding: 25px; }
}
</style>