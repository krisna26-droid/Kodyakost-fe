<template>
  <div class="manage-room-page">
    <div class="container">
      
      <div class="header">
        <BaseButton variant="ghost" icon @click="$router.push({ name: 'owner-properties' })" class="btn-back-style">
          <Icon icon="mdi:arrow-left" width="24" />
        </BaseButton>
        <div class="header-text">
          <h1 class="title">Manajemen Kamar</h1>
          <p class="subtitle" v-if="kostName">Properti: <strong>{{ kostName }}</strong></p>
        </div>
        <BaseButton variant="primary" @click="openModal">
          <template #icon-left><Icon icon="mdi:plus" /></template>
          Tambah Tipe
        </BaseButton>
      </div>

      <div v-if="loading" class="room-list">
        <div v-for="i in 3" :key="i" class="room-card skeleton-card">
          <BaseSkeleton width="120px" height="120px" border-radius="12px" />
          <div style="flex: 1">
            <BaseSkeleton width="50%" height="20px" class="mb-2" />
            <BaseSkeleton width="30%" height="15px" class="mb-4" />
            <BaseSkeleton width="100%" height="40px" border-radius="8px" />
          </div>
        </div>
      </div>

      <div v-else-if="rooms.length === 0" class="state-box empty">
        <div class="icon-bg">
          <Icon icon="mdi:bed-empty" width="50" />
        </div>
        <h3>Belum Ada Kamar</h3>
        <p>Tambahkan tipe kamar agar penyewa bisa mulai memesan kost Anda.</p>
        <BaseButton variant="primary" @click="openModal" class="mt-4">
          <template #icon-left><Icon icon="mdi:plus" /></template>
          Tambah Kamar Pertama
        </BaseButton>
      </div>

      <div v-else class="room-list">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div class="room-img">
            <img :src="getThumb(room.image)" :alt="room.room_type" />
          </div>
          <div class="room-info">
            <div class="top-row">
              <h3 class="room-name">{{ room.room_type }}</h3>
              <span class="price">{{ formatRupiah(room.price_per_month) }}<small>/bln</small></span>
            </div>
            
            <div class="details-grid">
              <div class="det-item">
                <Icon icon="mdi:door-open" />
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

            <div v-if="room.facilities?.length" class="facilities-row">
              <span v-for="fac in room.facilities.slice(0, 3)" :key="fac.id" class="fac-badge">
                {{ fac.name }}
              </span>
              <span v-if="room.facilities.length > 3" class="fac-more">
                +{{ room.facilities.length - 3 }}
              </span>
            </div>

            <div class="actions">
              <BaseButton variant="danger" icon size="sm" @click="confirmDeleteRoom(room.id)" title="Hapus Kamar">
                <Icon icon="mdi:trash-can-outline" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Tambah Kamar Baru</h3>
              <BaseButton variant="ghost" icon @click="closeModal"><Icon icon="mdi:close" /></BaseButton>
            </div>
            
            <form @submit.prevent="submitRoom" class="modal-form">
              <div class="form-group">
                <label>Nama Tipe Kamar <span class="req">*</span></label>
                <input v-model="form.room_type" type="text" placeholder="Standard, Deluxe, dll." required class="input-field" />
              </div>

              <div class="row">
                <div class="form-group">
                  <label>Harga / Bulan <span class="req">*</span></label>
                  <div class="input-price">
                    <span class="currency-label">Rp</span>
                    <input v-model="form.price_per_month" type="number" placeholder="1500000" required class="input-field pl-12" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Jumlah Kamar <span class="req">*</span></label>
                  <input v-model="form.total_rooms" type="number" min="1" required class="input-field" />
                </div>
              </div>

              <div class="form-group">
                <label>Fasilitas Kamar</label>
                <div v-if="loadingFacilities" class="loading-fac">
                  <Icon icon="mdi:loading" class="spin" /> Memuat...
                </div>
                <div v-else class="facilities-grid">
                  <label v-for="fac in allFacilities" :key="fac.id" class="fac-checkbox">
                    <input type="checkbox" :value="fac.id" v-model="form.facility_ids" />
                    <span class="custom-check"></span>
                    <span class="fac-name">{{ fac.name }}</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Foto Kamar <span class="req">*</span></label>
                <div class="file-upload-wrapper">
                  <input type="file" @change="handleFile" accept="image/*" class="input-file" />
                  <p class="hint">Upload foto interior kamar (Max 2MB)</p>
                </div>
              </div>

              <BaseButton variant="primary" type="submit" block :loading="submitting" class="mt-6">
                Simpan Kamar
              </BaseButton>
            </form>
          </div>
        </div>
      </Transition>

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
    if (kost) kostName.value = kost.name;
  } catch (e) { console.error(e); }
};

const fetchRooms = async () => {
  loading.value = true;
  try {
    const res = await ownerService.getRoomsByKost(kostId.value);
    rooms.value = res.data || res || [];
  } catch (e) {
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
  } catch (e) { console.error(e); }
  finally { loadingFacilities.value = false; }
};

const openModal = () => {
  showModal.value = true;
  if (allFacilities.value.length === 0) fetchFacilities();
};

const closeModal = () => {
  showModal.value = false;
  Object.assign(form, { room_type: '', price_per_month: '', total_rooms: 1, room_size: '', facility_ids: [], image: null });
};

const handleFile = (e) => {
  const file = e.target.files[0];
  if (file && file.size > 2 * 1024 * 1024) {
    notify.error("File terlalu besar (Max 2MB)");
    e.target.value = '';
    return;
  }
  form.image = file;
};

const submitRoom = async () => {
  if (!form.image) return notify.error("Foto kamar wajib diunggah!");
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

    await ownerService.createRoom(fd);
    notify.success("Kamar berhasil ditambahkan!");
    closeModal();
    fetchRooms();
  } catch (e) {
    notify.error(e.response?.data?.message || "Gagal menyimpan kamar.");
  } finally { submitting.value = false; }
};

const confirmDeleteRoom = async (roomId) => {
  const confirmed = await notify.confirm("Hapus Kamar?", "Tipe kamar ini beserta datanya akan dihapus permanen.");
  if (confirmed) {
    try {
      await ownerService.deleteRoom(roomId);
      rooms.value = rooms.value.filter(r => r.id !== roomId);
      notify.success("Kamar berhasil dihapus.");
    } catch (e) { notify.error("Gagal menghapus kamar."); }
  }
};

const getThumb = (p) => p ? (p.startsWith('http') ? p : `${BASE_STORAGE_URL}/storage/${p.replace(/^\//, '')}`) : 'https://placehold.co/400x300';
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

onMounted(() => {
  if (!kostId.value) router.push({ name: 'owner-properties' });
  else { fetchKostInfo(); fetchRooms(); }
});
</script>

<style scoped>
.manage-room-page { padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 900px; margin: 0 auto; }

/* HEADER */
.header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
.btn-back-style { background: white !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; }
.title { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; margin: 0; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

/* ROOM CARD */
.room-list { display: flex; flex-direction: column; gap: 1.25rem; }
.room-card { 
  background: white; border-radius: 20px; padding: 1.25rem; 
  display: flex; gap: 1.5rem; border: 1px solid #f1f5f9; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: 0.3s;
}
.room-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.room-img { width: 140px; height: 110px; border-radius: 14px; overflow: hidden; flex-shrink: 0; border: 1px solid #e2e8f0; }
.room-img img { width: 100%; height: 100%; object-fit: cover; }

.room-info { flex: 1; position: relative; }
.top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.room-name { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
.price { color: #059669; font-weight: 800; font-size: 1.2rem; }
.price small { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

.details-grid { display: flex; gap: 1.5rem; color: #64748b; font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
.det-item { display: flex; align-items: center; gap: 6px; }

.facilities-row { display: flex; gap: 6px; }
.fac-badge { background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; }
.fac-more { background: #f1f5f9; color: #94a3b8; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; }

.actions { position: absolute; bottom: 0; right: 0; }

/* MODAL & FORM */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; width: 100%; max-width: 600px; padding: 2.5rem; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }

.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-weight: 700; font-size: 0.85rem; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.input-field { width: 100%; padding: 12px 16px; border: 2px solid #f1f5f9; border-radius: 12px; font-size: 0.95rem; transition: 0.3s; outline: none; }
.input-field:focus { border-color: #fca311; background: #fffcf5; }

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.input-price { position: relative; }
.currency-label { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 800; color: #94a3b8; }
.pl-12 { padding-left: 3.5rem !important; }

.facilities-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #f8fafc; padding: 15px; border-radius: 12px; }
.fac-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; }
.fac-checkbox:hover { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.fac-checkbox input { display: none; }
.custom-check { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-radius: 6px; position: relative; transition: 0.3s; background: white; }
.fac-checkbox input:checked + .custom-check { background: #1e3a8a; border-color: #1e3a8a; }
.fac-checkbox input:checked + .custom-check::after { content: '✓'; position: absolute; color: white; font-size: 14px; top: 50%; left: 50%; transform: translate(-50%, -50%); }

.hint { font-size: 0.75rem; color: #94a3b8; margin-top: 6px; font-weight: 500; }

@media (max-width: 640px) {
  .room-card { flex-direction: column; }
  .room-img { width: 100%; height: 180px; }
  .row { grid-template-columns: 1fr; gap: 1rem; }
  .facilities-grid { grid-template-columns: 1fr; }
}
</style>