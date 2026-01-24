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
                <span>Sisa: {{ room.available_rooms }}</span>
              </div>
              <div class="det-item">
                <Icon icon="mdi:ruler-square" />
                <span>{{ room.room_size || '-' }}</span>
              </div>
            </div>

            <div class="actions">
              <button class="btn-icon delete" @click="deleteRoom(room.id)">
                <Icon icon="mdi:trash-can-outline" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Tambah Kamar Baru</h3>
            <button class="close" @click="closeModal"><Icon icon="mdi:close" /></button>
          </div>
          
          <form @submit.prevent="submitRoom">
            <div class="form-group">
              <label>Nama Tipe Kamar</label>
              <input v-model="form.room_type" type="text" placeholder="Contoh: Deluxe AC" required class="input-field" />
            </div>

            <div class="row">
              <div class="form-group">
                <label>Harga per Bulan</label>
                <input v-model="form.price_per_month" type="number" placeholder="1500000" required class="input-field" />
              </div>
              <div class="form-group">
                <label>Jumlah Kamar</label>
                <input v-model="form.total_rooms" type="number" placeholder="5" required class="input-field" />
              </div>
            </div>

            <div class="form-group">
              <label>Ukuran Kamar (Opsional)</label>
              <input v-model="form.room_size" type="text" placeholder="Contoh: 3x4 meter" class="input-field" />
            </div>

            <div class="form-group">
              <label>Foto Kamar</label>
              <input type="file" @change="handleFile" accept="image/*" class="input-file" />
            </div>

            <button type="submit" class="btn-save" :disabled="submitting">
              <span v-if="submitting">Menyimpan...</span>
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
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import ownerService from '@/services/ownerService';

const route = useRoute();
const kostId = route.params.id; // Ambil ID kost dari URL

const rooms = ref([]);
const loading = ref(true);
const kostName = ref('');
const showModal = ref(false);
const submitting = ref(false);
const API_BASE_URL = 'http://localhost:8000'; // Sesuaikan jika beda

const form = reactive({
  room_type: '',
  price_per_month: '',
  total_rooms: '',
  room_size: '',
  image: null
});

// --- FETCH DATA ---
const fetchData = async () => {
  loading.value = true;
  try {
    // 1. Ambil Info Kost untuk Header
    const kost = await ownerService.getKostDetail(kostId);
    if (kost) kostName.value = kost.name;

    // 2. Ambil List Kamar
    const data = await ownerService.getRoomsByKost(kostId);
    rooms.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// --- ACTIONS ---
const openModal = () => showModal.value = true;
const closeModal = () => {
  showModal.value = false;
  // Reset Form
  form.room_type = ''; form.price_per_month = ''; form.total_rooms = ''; form.room_size = ''; form.image = null;
};

const handleFile = (e) => {
  form.image = e.target.files[0];
};

const submitRoom = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('kost_id', kostId);
    formData.append('room_type', form.room_type);
    formData.append('price_per_month', form.price_per_month);
    formData.append('total_rooms', form.total_rooms);
    if (form.room_size) formData.append('room_size', form.room_size);
    if (form.image) formData.append('image', form.image);

    await ownerService.createRoom(formData);
    
    alert("Kamar berhasil ditambahkan!");
    closeModal();
    fetchData(); // Refresh list
  } catch (error) {
    alert("Gagal menambah kamar. Cek koneksi atau data input.");
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const deleteRoom = async (id) => {
  if (!confirm("Hapus tipe kamar ini?")) return;
  try {
    await ownerService.deleteRoom(id);
    rooms.value = rooms.value.filter(r => r.id !== id);
  } catch (error) {
    alert("Gagal menghapus kamar.");
  }
};

// --- HELPERS ---
const getThumb = (path) => {
  if (!path) return 'https://placehold.co/200x150?text=Kamar';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/storage/${path}`;
};
const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.manage-room-page { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 800px; margin: 0 auto; }

/* HEADER */
.header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
.btn-back { width: 40px; height: 40px; border-radius: 50%; background: white; border: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; font-size: 0.9rem; }
.btn-add { margin-left: auto; background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; }

/* STATES */
.state-box { text-align: center; padding: 60px; }
.empty { background: white; border-radius: 12px; border: 1px dashed #cbd5e1; }
.icon-bg { width: 70px; height: 70px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #94a3b8; }
.spin { animation: spin 1s linear infinite; }

/* LIST */
.room-list { display: flex; flex-direction: column; gap: 15px; }
.room-card { background: white; border-radius: 12px; padding: 15px; display: flex; gap: 20px; border: 1px solid #e2e8f0; align-items: center; }
.room-img { width: 100px; height: 80px; border-radius: 8px; overflow: hidden; background: #e2e8f0; flex-shrink: 0; }
.room-img img { width: 100%; height: 100%; object-fit: cover; }
.room-info { flex: 1; }
.top-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
.room-name { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0; }
.price { color: #059669; font-weight: 700; }
.details-grid { display: flex; gap: 15px; color: #64748b; font-size: 0.85rem; }
.det-item { display: flex; align-items: center; gap: 5px; }
.actions { margin-left: auto; }
.btn-icon.delete { width: 32px; height: 32px; border-radius: 6px; background: #fee2e2; color: #ef4444; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-icon.delete:hover { background: #ef4444; color: white; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; width: 100%; max-width: 500px; padding: 25px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { margin: 0; font-size: 1.2rem; }
.close { background: none; border: none; font-size: 1.2rem; cursor: pointer; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; }
.input-field { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.btn-save { width: 100%; background: #1e3a8a; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; }
.btn-save:disabled { background: #94a3b8; }
</style>