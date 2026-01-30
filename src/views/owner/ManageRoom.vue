<template>
  <div class="manage-room-page">
    <div class="container">
      
      <div class="header">
        <button class="btn-back" @click="$router.push({ name: 'owner-properties' })">
          <Icon icon="mdi:arrow-left" />
        </button>
        <div>
          <h1 class="title">Manajemen Kamar</h1>
          <p class="subtitle" v-if="kostName">Untuk Properti: <strong>{{ kostName }}</strong></p>
        </div>
        <button class="btn-add" @click="openModal">
          <Icon icon="mdi:plus" /> Tambah Tipe Kamar
        </button>
      </div>

      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin icon-lg" />
        <p>Memuat data kamar...</p>
      </div>

      <div v-else-if="rooms.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:bed-empty" width="50" />
        </div>
        <h3>Belum Ada Kamar</h3>
        <p>Tambahkan tipe kamar agar penyewa bisa mulai memesan.</p>
        <button class="btn-primary" @click="openModal">
          <Icon icon="mdi:plus" /> Tambah Kamar Pertama
        </button>
      </div>

      <div v-else class="room-list">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div class="room-img">
            <img :src="getThumb(room.image)" alt="Room" />
          </div>
          <div class="room-info">
            <div class="top-row">
              <h3 class="room-name">{{ room.room_type }}</h3>
              <span class="price">{{ formatRupiah(room.price_per_month) }} <small>/bln</small></span>
            </div>
            
            <div class="details-grid">
              <div class="det-item">
                <Icon icon="mdi:door" />
                <span>Total: {{ room.total_rooms }}</span>
              </div>
              <div class="det-item">
                <Icon icon="mdi:bed" />
                <span>Tersedia: {{ room.available_rooms }}</span>
              </div>
              <div class="det-item" v-if="room.room_size">
                <Icon icon="mdi:ruler-square" />
                <span>{{ room.room_size }}</span>
              </div>
            </div>

            <div v-if="room.facilities && room.facilities.length > 0" class="facilities-row">
              <span v-for="fac in room.facilities.slice(0, 3)" :key="fac.id" class="fac-badge">
                {{ fac.name }}
              </span>
              <span v-if="room.facilities.length > 3" class="fac-more">
                +{{ room.facilities.length - 3 }} lainnya
              </span>
            </div>

            <div class="actions">
              <button class="btn-icon delete" @click="confirmDeleteRoom(room.id)" title="Hapus">
                <Icon icon="mdi:trash-can-outline" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Kamar Baru</h3>
            <button class="close" @click="closeModal"><Icon icon="mdi:close" /></button>
          </div>
          
          <form @submit.prevent="submitRoom">
            <div class="form-group">
              <label>Nama Tipe Kamar <span class="req">*</span></label>
              <input v-model="form.room_type" type="text" placeholder="Contoh: Standard, Deluxe, VIP" required class="input-field" />
            </div>

            <div class="row">
              <div class="form-group">
                <label>Harga per Bulan <span class="req">*</span></label>
                <div class="input-price">
                  <span>Rp</span>
                  <input v-model="form.price_per_month" type="number" placeholder="1500000" required class="input-field" />
                </div>
              </div>
              <div class="form-group">
                <label>Jumlah Kamar <span class="req">*</span></label>
                <input v-model="form.total_rooms" type="number" min="1" placeholder="5" required class="input-field" />
              </div>
            </div>

            <div class="form-group">
              <label>Ukuran Kamar</label>
              <input v-model="form.room_size" type="text" placeholder="Contoh: 3x4m" class="input-field" />
            </div>

            <div class="form-group">
              <label>Fasilitas Kamar</label>
              <div v-if="loadingFacilities" class="loading-fac">
                <Icon icon="mdi:loading" class="spin" /> Memuat fasilitas...
              </div>
              <div v-else class="facilities-grid">
                <label v-for="fac in allFacilities" :key="fac.id" class="fac-checkbox">
                  <input type="checkbox" :value="fac.id" v-model="form.facility_ids" />
                  <span>{{ fac.name }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Foto Kamar <span class="req">*</span></label>
              <input type="file" @change="handleFile" accept="image/*" class="input-file" required />
              <small class="hint">Maksimal 2MB. Format: JPG, PNG</small>
            </div>

            <button type="submit" class="btn-save" :disabled="submitting">
              <Icon v-if="submitting" icon="mdi:loading" class="spin" />
              <span v-else>Simpan Kamar</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';
import { notify } from '@/utils/swal';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const kostId = ref(route.params.id);

const rooms = ref([]);
const loading = ref(true);
const kostName = ref('');
const showModal = ref(false);
const submitting = ref(false);
const allFacilities = ref([]);
const loadingFacilities = ref(false);

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

const form = reactive({
  room_type: '',
  price_per_month: '',
  total_rooms: 1,
  room_size: '',
  facility_ids: [],
  image: null
});

const fetchKostInfo = async () => {
  try {
    const res = await ownerService.getMyKosts();
    const kosts = res.data || res;
    const kost = kosts.find(k => Number(k.id) === Number(kostId.value));
    if (kost) {
      kostName.value = kost.name;
      console.log("✅ [ManageRoom] Kost Info:", kostName.value);
    }
  } catch (e) { 
    console.error("❌ [ManageRoom] Error Fetch Info:", e); 
  }
};

const fetchRooms = async () => {
  loading.value = true;
  try {
    const res = await ownerService.getRoomsByKost(kostId.value);
    rooms.value = res.data || res || [];
    console.log("✅ [ManageRoom] Daftar Kamar:", rooms.value);
  } catch (e) { 
    console.error("❌ [ManageRoom] Error Fetch Rooms:", e);
    notify.error("Gagal memuat data kamar."); 
  } finally { 
    loading.value = false; 
  }
};

const fetchFacilities = async () => {
  loadingFacilities.value = true;
  try {
    const res = await axios.get(`${API_URL}/facilities`);
    allFacilities.value = res.data?.data || [];
    console.log("✅ [ManageRoom] Facilities loaded:", allFacilities.value.length);
  } catch (e) { 
    console.error("❌ [ManageRoom] Error Fetch Facilities:", e); 
  } finally { 
    loadingFacilities.value = false; 
  }
};

const openModal = () => {
  showModal.value = true;
  if (allFacilities.value.length === 0) fetchFacilities();
};

const closeModal = () => {
  showModal.value = false;
  Object.assign(form, { 
    room_type: '', 
    price_per_month: '', 
    total_rooms: 1, 
    room_size: '',
    facility_ids: [], 
    image: null 
  });
};

const handleFile = (e) => { 
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.size > 2 * 1024 * 1024) {
    notify.error("File terlalu besar. Maksimal 2MB.");
    e.target.value = '';
    return;
  }
  
  form.image = file;
  console.log("📸 [ManageRoom] File selected:", file.name);
};

const submitRoom = async () => {
  if (!form.image) {
    notify.error("Foto kamar wajib diunggah!");
    return;
  }
  
  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append('kost_id', kostId.value);
    fd.append('room_type', form.room_type);
    fd.append('price_per_month', form.price_per_month);
    fd.append('total_rooms', form.total_rooms);
    if (form.room_size) fd.append('room_size', form.room_size);
    form.facility_ids.forEach(id => fd.append('facility_ids[]', id));
    fd.append('image', form.image);

    console.log("📤 [ManageRoom] Submitting room data...");
    await ownerService.createRoom(fd);
    
    notify.success("Kamar berhasil ditambahkan!");
    closeModal();
    fetchRooms();
  } catch (e) { 
    console.error("❌ [ManageRoom] Error Submit:", e);
    notify.error(e.response?.data?.message || "Gagal menyimpan kamar."); 
  } finally { 
    submitting.value = false; 
  }
};

// ✅ FIX: Tambahkan fungsi deleteRoom yang hilang
const confirmDeleteRoom = async (roomId) => {
  const room = rooms.value.find(r => r.id === roomId);
  if (!room) return;
  
  const confirmed = await notify.confirm(
    "Hapus Kamar?", 
    `Yakin ingin menghapus kamar "${room.room_type}"?`
  );
  
  if (confirmed) {
    try {
      await ownerService.deleteRoom(roomId);
      rooms.value = rooms.value.filter(r => r.id !== roomId);
      notify.success("Kamar berhasil dihapus.");
    } catch (error) {
      console.error("❌ [ManageRoom] Error Delete:", error);
      notify.error("Gagal menghapus kamar.");
    }
  }
};

const getThumb = (path) => {
  if (!path) return 'https://placehold.co/400x300?text=No+Image';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; 
  }
  
  const cleanPath = path.replace(/^\//, '');
  
  let finalUrl = '';
  if (cleanPath.startsWith('storage/')) {
    finalUrl = `${BASE_STORAGE_URL}/${cleanPath}`;
  } else {
    finalUrl = `${BASE_STORAGE_URL}/storage/${cleanPath}`;
  }

  return finalUrl;
};

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(num || 0);
};

onMounted(() => {
  console.log("🚀 [ManageRoom] Mounted. Kost ID:", kostId.value);
  
  if (!kostId.value) {
    notify.error("ID properti tidak ditemukan");
    router.push({ name: 'owner-properties' });
  } else {
    fetchKostInfo();
    fetchRooms();
  }
});
</script>

<style scoped>
.manage-room-page { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 900px; margin: 0 auto; }

/* HEADER */
.header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
.btn-back { width: 42px; height: 42px; border-radius: 10px; background: white; border: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-back:hover { background: #f8fafc; border-color: #1e3a8a; color: #1e3a8a; }
.title { font-size: 1.6rem; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; font-size: 0.9rem; margin: 4px 0 0 0; }
.btn-add { margin-left: auto; background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.btn-add:hover { background: #172554; transform: translateY(-2px); }

/* STATES */
.state-box { text-align: center; padding: 60px 20px; }
.empty { background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }
.icon-bg { width: 70px; height: 70px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #94a3b8; }
.icon-lg { font-size: 2.5rem; color: #1e3a8a; }
.spin { animation: spin 1s linear infinite; }
.btn-primary { margin-top: 20px; background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }

/* LIST */
.room-list { display: flex; flex-direction: column; gap: 15px; }
.room-card { background: white; border-radius: 14px; padding: 18px; display: flex; gap: 20px; border: 1px solid #e2e8f0; align-items: flex-start; transition: 0.2s; }
.room-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.room-img { width: 120px; height: 90px; border-radius: 10px; overflow: hidden; background: #e2e8f0; flex-shrink: 0; }
.room-img img { width: 100%; height: 100%; object-fit: cover; }
.room-info { flex: 1; }
.top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.room-name { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 0; }
.price { color: #059669; font-weight: 700; font-size: 1.1rem; }
.price small { font-size: 0.75rem; color: #64748b; font-weight: normal; }
.details-grid { display: flex; gap: 20px; color: #64748b; font-size: 0.85rem; margin-bottom: 10px; }
.det-item { display: flex; align-items: center; gap: 6px; }

.facilities-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.fac-badge { background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.fac-more { background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }

.actions { display: flex; gap: 8px; margin-top: 10px; }
.btn-icon.delete { width: 36px; height: 36px; border-radius: 8px; background: #fee2e2; color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-icon.delete:hover { background: #ef4444; color: white; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.modal-content { background: white; width: 100%; max-width: 550px; padding: 30px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.modal-header h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #1e293b; }
.close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: 0.2s; }
.close:hover { background: #e2e8f0; color: #1e293b; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.9rem; color: #334155; }
.req { color: #ef4444; }
.input-field { width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; font-family: inherit; transition: 0.2s; font-size: 0.95rem; }
.input-field:focus { border-color: #1e3a8a; box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.08); }
.input-file { width: 100%; padding: 8px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.9rem; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.input-price { position: relative; }
.input-price span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #64748b; }
.input-price input { padding-left: 40px; }
.hint { font-size: 0.8rem; color: #94a3b8; margin-top: 4px; display: block; }

.facilities-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.fac-checkbox { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.fac-checkbox:hover { background: #f8fafc; }
.fac-checkbox input { width: 18px; height: 18px; accent-color: #1e3a8a; }
.fac-checkbox span { font-size: 0.9rem; color: #475569; }
.loading-fac { padding: 20px; text-align: center; color: #64748b; }

.btn-save { width: 100%; background: #1e3a8a; color: white; border: none; padding: 13px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 15px; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.95rem; }
.btn-save:hover:not(:disabled) { background: #172554; transform: translateY(-2px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .room-card { flex-direction: column; }
  .room-img { width: 100%; height: 160px; }
  .row { grid-template-columns: 1fr; }
  .facilities-grid { grid-template-columns: 1fr; }
}
</style>