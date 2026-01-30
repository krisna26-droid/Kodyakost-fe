<template>
  <div class="home-view">
    <header class="hero-mini">
      <div class="container hero-content">
        <div class="header-text">
          <h1>Kalender <span class="highlight">Budaya</span></h1>
          <p>Pantau upacara adat dan prediksi lalu lintas Denpasar</p>
        </div>
        <BaseButton v-if="isAdmin" variant="primary" size="md" @click="openAddModal">
          <template #icon-left><Icon icon="mdi:plus-circle" /></template>
          Tambah Event
        </BaseButton>
      </div>
    </header>

    <section class="section container">
      <div v-if="loading" class="property-grid">
        <div v-for="i in 3" :key="i" class="event-card-skeleton">
          <BaseSkeleton height="160px" border-radius="20px 20px 0 0" />
          <div class="p-4">
            <BaseSkeleton width="40%" height="15px" class="mb-2" />
            <BaseSkeleton width="80%" height="25px" class="mb-4" />
            <BaseSkeleton height="60px" />
          </div>
        </div>
      </div>

      <div v-else-if="events.length === 0" class="empty-state">
        <div class="empty-box">
          <Icon icon="mdi:calendar-search" width="64" color="#cbd5e1" />
          <p>Belum ada jadwal upacara terdaftar.</p>
          <BaseButton variant="outline" @click="fetchEvents" class="mt-4">Segarkan Halaman</BaseButton>
        </div>
      </div>

      <div v-else class="property-grid">
        <div v-for="event in events" :key="event.id" class="event-card">
          
          <div v-if="isAdmin" class="admin-overlay-tools">
            <BaseButton variant="ghost" icon @click="openEditModal(event)" class="tool-btn" title="Edit">
              <Icon icon="mdi:pencil-outline" />
            </BaseButton>
            <BaseButton variant="danger" icon @click="confirmDelete(event.id)" class="tool-btn" title="Hapus">
              <Icon icon="mdi:trash-can-outline" />
            </BaseButton>
          </div>

          <div class="card-image-static" :class="getSeverityClass(event.severity)">
            <div class="severity-pill-left">
              <Icon icon="mdi:traffic-light" width="14" />
              {{ getSeverityText(event.severity) }}
            </div>
            <Icon icon="mdi:temple-hindu" class="bg-icon-watermark" />
          </div>

          <div class="card-details">
            <div class="date-row">
              <Icon icon="mdi:calendar-clock" />
              <span>{{ formatDate(event.event_date) }}</span>
            </div>
            
            <h3 class="title">{{ event.event_name }}</h3>
            
            <div class="type-row">
              <span class="type-badge">{{ formatEventTypeName(event.event_type) }}</span>
            </div>

            <p class="event-desc">{{ event.description }}</p>

            <div class="card-footer-action">
              <a :href="`https://www.google.com/maps?q=${event.latitude},${event.longitude}`" target="_blank" class="btn-maps">
                <Icon icon="mdi:google-maps" /> Lihat Lokasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Transition name="modal">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Update Event Budaya' : 'Tambah Event Baru' }}</h3>
            <BaseButton variant="ghost" icon @click="closeModal" class="text-white">
              <Icon icon="mdi:close" />
            </BaseButton>
          </div>
          
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-grid">
              <div class="input-side">
                <div class="field">
                  <label>Nama Upacara / Event</label>
                  <input v-model="form.event_name" placeholder="Misal: Odalan Pura Jagatnatha" required />
                </div>

                <div class="field-row">
                  <div class="field">
                    <label>Kategori</label>
                    <select v-model="form.event_type" required>
                      <option value="" disabled>Pilih Tipe</option>
                      <option value="upacara_adat">Upacara Adat</option>
                      <option value="pawai">Pawai / Ngaben</option>
                      <option value="festival">Festival</option>
                      <option value="penutupan_jalan">Penutupan Jalan</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Prediksi Lalu Lintas</label>
                    <select v-model="form.severity" required>
                      <option value="low">🟢 Lancar (Normal)</option>
                      <option value="medium">🟡 Padat Merayap</option>
                      <option value="high">🔴 Macet Total (Hindari)</option>
                    </select>
                  </div>
                </div>

                <div class="field">
                  <label>Tanggal Pelaksanaan</label>
                  <input v-model="form.event_date" type="date" required />
                </div>

                <div class="field">
                  <label>Detail Keterangan</label>
                  <textarea v-model="form.description" rows="3" placeholder="Informasi rute atau jam penutupan..."></textarea>
                </div>
              </div>

              <div class="map-side">
                <label>Pinpoint Lokasi (Klik atau Geser Marker)</label>
                <div id="map-picker" class="map-box"></div>
                <div class="coord-info">
                  <span>Lat: {{ form.latitude }}</span>
                  <span>Lng: {{ form.longitude }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <BaseButton variant="outline" type="button" @click="closeModal">Batal</BaseButton>
              <BaseButton variant="primary" type="submit" :loading="processing">
                {{ isEditing ? 'Update Event' : 'Simpan Event' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import culturalService from '@/services/culturalServices'; 
import { useAuthStore } from '@/stores/auth';
import { notify } from '@/utils/swal';
import { Icon } from '@iconify/vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const authStore = useAuthStore();
const events = ref([]);
const loading = ref(true);
const processing = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const form = ref({
  event_name: '',
  event_type: '', 
  description: '',
  event_date: '',
  latitude: -8.65,
  longitude: 115.21,
  severity: 'low'
});

const isAdmin = computed(() => authStore.isAdmin);

// --- MAP LOGIC ---
let map = null;
let marker = null;

const initMap = () => {
  nextTick(() => {
    if (map) { map.remove(); map = null; }
    const mapElement = document.getElementById('map-picker');
    if (!mapElement) return;

    map = L.map('map-picker').setView([form.value.latitude, form.value.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    marker = L.marker([form.value.latitude, form.value.longitude], { draggable: true }).addTo(map);

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      updateCoords(lat, lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      updateCoords(lat, lng);
    });
    
    setTimeout(() => { map.invalidateSize(); }, 300);
  });
};

const updateCoords = (lat, lng) => {
  form.value.latitude = parseFloat(lat.toFixed(6));
  form.value.longitude = parseFloat(lng.toFixed(6));
};

const fetchEvents = async () => {
  try {
    loading.value = true;
    events.value = await culturalService.getEvents();
  } catch (err) {
    notify.error("Gagal sinkronisasi data event.");
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  form.value = { event_name: '', event_type: '', description: '', event_date: '', latitude: -8.65, longitude: 115.21, severity: 'low' };
  isModalOpen.value = true;
  initMap();
};

const openEditModal = (event) => {
  isEditing.value = true;
  currentId.value = event.id;
  form.value = { ...event, latitude: parseFloat(event.latitude), longitude: parseFloat(event.longitude) };
  isModalOpen.value = true;
  initMap();
};

const handleSubmit = async () => {
  processing.value = true;
  try {
    isEditing.value 
      ? await culturalService.updateEvent(currentId.value, form.value) 
      : await culturalService.createEvent(form.value);
    
    notify.success(isEditing.value ? "Data diperbarui!" : "Event berhasil masuk kalender!");
    closeModal();
    fetchEvents();
  } catch (err) {
    notify.error("Gagal menyimpan data.");
  } finally {
    processing.value = false;
  }
};

const confirmDelete = async (id) => {
  const ok = await notify.confirm("Hapus Event?", "Jadwal ini akan dihilangkan dari kalender publik.");
  if (ok) {
    try {
      await culturalService.deleteEvent(id);
      notify.success("Event terhapus.");
      fetchEvents();
    } catch (err) {
      notify.error("Gagal menghapus.");
    }
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  if (map) map.remove();
  map = null;
};

// --- HELPERS ---
const getSeverityClass = (s) => ({ 'tag-high': s === 'high', 'tag-medium': s === 'medium', 'tag-low': s === 'low' });
const getSeverityText = (s) => ({ 'high': 'Macet Total', 'medium': 'Padat Merayap', 'low': 'Lancar' }[s] || 'Lancar');
const formatEventTypeName = (t) => t ? t.replace(/_/g, ' ').toUpperCase() : '-';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

onMounted(fetchEvents);
</script>

<style scoped>
.home-view { font-family: 'Poppins', sans-serif; background-color: #f8fafc; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* HERO MINI */
.hero-mini { background: white; padding: 50px 0; border-bottom: 1px solid #e2e8f0; }
.hero-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.header-text h1 { font-size: var(--font-xl); color: #1f3a52; font-weight: 800; margin-bottom: 5px; }
.highlight { color: #fca311; }

/* GRID & CARDS */
.property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; margin-top: 20px; }
.event-card { 
  background: white; border-radius: 20px; overflow: hidden; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s; position: relative;
  border: 1px solid #f1f5f9;
}
.event-card:hover { transform: translateY(-8px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }

/* SEVERITY */
.card-image-static { height: 160px; position: relative; display: flex; align-items: center; justify-content: center; }
.bg-icon-watermark { font-size: 110px; color: rgba(255,255,255,0.25); position: absolute; }
.tag-low { background: linear-gradient(135deg, #10b981, #059669); }
.tag-medium { background: linear-gradient(135deg, #f59e0b, #d97706); }
.tag-high { background: linear-gradient(135deg, #ef4444, #b91c1c); }

.severity-pill-left {
  position: absolute; top: 15px; left: 15px;
  padding: 6px 14px; border-radius: 12px;
  font-weight: 800; font-size: 0.7rem; z-index: 2;
  color: white; background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; gap: 6px; text-transform: uppercase;
}

/* DETAILS */
.card-details { padding: 25px; }
.date-row { display: flex; align-items: center; gap: 8px; color: #fca311; font-weight: 700; font-size: 0.85rem; margin-bottom: 12px; }
.title { font-size: 1.25rem; color: #1f3a52; font-weight: 800; margin-bottom: 10px; line-height: 1.3; }
.type-badge { background: #f0fbfb; color: #1f3a52; padding: 5px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2f2f2; }
.event-desc { color: #64748b; font-size: 0.85rem; line-height: 1.6; margin: 15px 0; height: 3.2em; overflow: hidden; display: -webkit-box;  -webkit-box-orient: vertical; }

.btn-maps { 
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 12px; border: 2px solid #f1f5f9; border-radius: 12px; text-decoration: none;
  color: #1f3a52; font-weight: 700; font-size: 0.9rem; transition: 0.3s;
}
.btn-maps:hover { background: #1f3a52; color: white; border-color: #1f3a52; }

/* ADMIN TOOLS */
.admin-overlay-tools {
  position: absolute; top: 15px; right: 15px;
  display: flex; gap: 10px; z-index: 10;
}
.tool-btn { box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; width: 36px !important; height: 36px !important; }

/* STATES */
.empty-state { padding: 80px 0; text-align: center; background: white; border-radius: 20px; border: 2px dashed #e2e8f0; }
.loading-state { text-align: center; padding: 60px 0; color: #64748b; }

/* MODAL & MAP */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { background: white; width: 100%; max-width: 900px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
.modal-header { background: #1f3a52; color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
.form-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; padding: 30px; max-height: 70vh; overflow-y: auto; }
.field { margin-bottom: 20px; }
.field label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.field input, .field select, .field textarea { width: 100%; padding: 12px 16px; border: 2px solid #f1f5f9; border-radius: 12px; font-size: 0.9rem; transition: 0.3s; }
.field input:focus { border-color: #fca311; outline: none; background: #fffcf5; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.map-box { height: 350px; border-radius: 16px; border: 2px solid #f1f5f9; background: #f8fafc; z-index: 1; }
.coord-info { margin-top: 10px; display: flex; justify-content: space-between; font-size: 0.7rem; font-family: monospace; color: #94a3b8; }
.modal-footer { padding: 20px 30px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0; }

/* ANIMATION */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .modal-card { height: 95vh; }
  .map-box { height: 250px; }
  .field-row { grid-template-columns: 1fr; gap: 0; }
}
</style>