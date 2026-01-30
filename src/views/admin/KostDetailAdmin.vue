<template>
  <div class="detail-page">
    <div class="container">

      <div class="page-header">
        <BaseButton variant="outline" size="sm" @click="goBack">
          <template #icon-left><Icon icon="mdi:arrow-left" /></template>
          Kembali
        </BaseButton>
        <div class="header-status">
          <span class="status-label">Status:</span>
          <span class="status-badge" :class="kost?.is_verified ? 'approved' : 'pending'">
            <Icon :icon="kost?.is_verified ? 'mdi:check-decagram' : 'mdi:clock-outline'" width="16" />
            {{ kost?.is_verified ? 'Terverifikasi' : 'Menunggu Verifikasi' }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="loading-state-container">
        <div class="content-wrapper">
          <div class="main-section">
            <BaseSkeleton height="400px" border-radius="16px" class="mb-4" />
            <div class="card">
              <BaseSkeleton width="40%" height="24px" class="mb-4" />
              <BaseSkeleton v-for="i in 3" :key="i" height="20px" class="mb-2" />
            </div>
            <div class="card">
              <BaseSkeleton width="30%" height="24px" class="mb-4" />
              <div class="location-grid">
                <BaseSkeleton v-for="i in 4" :key="i" height="60px" border-radius="10px" />
              </div>
            </div>
          </div>
          <div class="sidebar-section">
            <BaseSkeleton height="250px" border-radius="16px" class="mb-4" />
            <BaseSkeleton height="200px" border-radius="16px" class="mb-4" />
            <BaseSkeleton height="300px" border-radius="16px" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-card">
          <Icon icon="mdi:alert-circle-outline" width="64" />
          <h3>Gagal Memuat Data</h3>
          <p>{{ error }}</p>
          <BaseButton variant="primary" @click="fetchDetail" class="mt-4">
            <template #icon-left><Icon icon="mdi:refresh" /></template>
            Coba Lagi
          </BaseButton>
        </div>
      </div>

      <div v-else-if="kost" class="content-wrapper">
        
        <div class="main-section">
          
          <div class="card gallery-card">
            <h2 class="card-title">
              <Icon icon="mdi:image-multiple" />
              Galeri Foto
            </h2>
            
            <div class="gallery-grid">
              <div class="main-photo">
                <img :src="getStorageUrl(kost.thumbnail || kost.main_image)" alt="Foto Utama" />
                <div class="photo-label">Foto Utama</div>
              </div>
              
              <div v-if="kost.rooms && kost.rooms.length > 0" class="room-photos">
                <div v-for="(room, index) in kost.rooms.slice(0, 4)" :key="room.id" class="photo-item">
                  <img :src="getStorageUrl(room.image)" :alt="`Foto ${room.room_type}`" />
                  <div class="photo-label">{{ room.room_type || room.type }}</div>
                </div>
              </div>
              
              <div v-if="kost.images && kost.images.length > 0" class="additional-photos">
                <div v-for="(img, index) in kost.images.slice(0, 2)" :key="index" class="photo-item">
                  <img :src="getStorageUrl(img.path || img)" :alt="`Foto ${index + 1}`" />
                </div>
              </div>
            </div>
          </div>

          <div class="card info-card">
            <h2 class="card-title">
              <Icon icon="mdi:information" />
              Informasi Dasar
            </h2>
            
            <div class="info-row">
              <div class="info-label">
                <Icon icon="mdi:home-city" />
                Nama Properti
              </div>
              <div class="info-value">{{ kost.name }}</div>
            </div>

            <div class="info-row">
              <div class="info-label">
                <Icon icon="mdi:key" />
                ID Properti
              </div>
              <div class="info-value">#{{ kost.id }}</div>
            </div>

            <div class="info-row">
              <div class="info-label">
                <Icon icon="mdi:home-variant" />
                Tipe Kost
              </div>
              <div class="info-value">{{ kost.type || 'Campur' }}</div>
            </div>

            <div class="info-row">
              <div class="info-label">
                <Icon icon="mdi:text-box" />
                Deskripsi
              </div>
              <div class="info-value desc-text">{{ kost.description || 'Tidak ada deskripsi' }}</div>
            </div>
          </div>

          <div class="card location-card">
            <h2 class="card-title">
              <Icon icon="mdi:map-marker-radius" />
              Detail Lokasi
            </h2>

            <div class="info-row">
              <div class="info-label">
                <Icon icon="mdi:map-marker" />
                Alamat Lengkap
              </div>
              <div class="info-value">{{ kost.address || '-' }}</div>
            </div>

            <div class="location-grid">
              <div class="location-item">
                <Icon icon="mdi:map-marker-radius" />
                <div>
                  <span class="label">Kecamatan</span>
                  <span class="value">{{ kost.district || '-' }}</span>
                </div>
              </div>
              <div class="location-item">
                <Icon icon="mdi:home-city" />
                <div>
                  <span class="label">Desa/Kelurahan</span>
                  <span class="value">{{ kost.village || '-' }}</span>
                </div>
              </div>
              <div class="location-item">
                <Icon icon="mdi:city" />
                <div>
                  <span class="label">Kota</span>
                  <span class="value">{{ kost.city || 'Denpasar' }}</span>
                </div>
              </div>
              <div class="location-item">
                <Icon icon="mdi:map" />
                <div>
                  <span class="label">Provinsi</span>
                  <span class="value">{{ kost.province || 'Bali' }}</span>
                </div>
              </div>
            </div>

            <div class="coordinate-box">
              <div class="coord-row">
                <Icon icon="mdi:crosshairs-gps" />
                <div class="coord-content">
                  <div class="coord-item">
                    <span class="coord-label">Latitude:</span>
                    <span class="coord-value">{{ kost.latitude || '-' }}</span>
                  </div>
                  <div class="coord-item">
                    <span class="coord-label">Longitude:</span>
                    <span class="coord-value">{{ kost.longitude || '-' }}</span>
                  </div>
                </div>
              </div>
              <a 
                v-if="kost.latitude && kost.longitude"
                :href="`https://www.google.com/maps/search/?api=1&query=${kost.latitude},${kost.longitude}`"
                target="_blank" 
                class="btn-map"
              >
                <Icon icon="mdi:google-maps" /> Buka di Google Maps
              </a>
            </div>
          </div>

          <div v-if="allFacilities.length > 0" class="card facilities-card">
            <h2 class="card-title">
              <Icon icon="mdi:star-circle" />
              Fasilitas Properti
            </h2>
            
            <div class="facilities-grid">
              <div v-for="fac in allFacilities" :key="fac" class="facility-item">
                <Icon :icon="getFacilityIcon(fac)" class="fac-icon" />
                <span>{{ fac }}</span>
              </div>
            </div>
          </div>

          <div class="card rooms-card">
            <h2 class="card-title">
              <Icon icon="mdi:bed-king" />
              Tipe Kamar & Harga ({{ kost.rooms?.length || 0 }} Tipe)
            </h2>

            <div v-if="!kost.rooms || kost.rooms.length === 0" class="empty-state">
              <Icon icon="mdi:bed-empty" width="48" />
              <p>Belum ada tipe kamar ditambahkan</p>
              <small>Pemilik akan menambahkan setelah verifikasi</small>
            </div>

            <div v-else class="rooms-list">
              <div v-for="room in kost.rooms" :key="room.id" class="room-detail-card">
                <div class="room-header">
                  <div class="room-image">
                    <img :src="getStorageUrl(room.image)" :alt="room.room_type" />
                  </div>
                  <div class="room-header-info">
                    <h3 class="room-type">{{ room.room_type || room.type }}</h3>
                    <div class="room-price">{{ formatRupiah(room.price_per_month || room.price) }} <small>/bulan</small></div>
                  </div>
                </div>

                <div class="room-details-grid">
                  <div class="room-detail-item">
                    <Icon icon="mdi:door" />
                    <div>
                      <span class="label">Total Kamar</span>
                      <span class="value">{{ room.total_rooms || room.total || 0 }} kamar</span>
                    </div>
                  </div>
                  <div class="room-detail-item">
                    <Icon icon="mdi:door-open" />
                    <div>
                      <span class="label">Tersedia</span>
                      <span class="value" :class="room.available_rooms > 0 ? 'text-green' : 'text-red'">
                        {{ room.available_rooms || room.available || 0 }} kamar
                      </span>
                    </div>
                  </div>
                  <div v-if="room.room_size || room.size" class="room-detail-item">
                    <Icon icon="mdi:ruler-square" />
                    <div>
                      <span class="label">Ukuran</span>
                      <span class="value">{{ room.room_size || room.size }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="room.facilities && room.facilities.length > 0" class="room-facilities">
                  <div class="room-fac-label">
                    <Icon icon="mdi:check-circle" />
                    Fasilitas Kamar:
                  </div>
                  <div class="room-fac-tags">
                    <span v-for="fac in room.facilities" :key="fac.id" class="fac-tag">
                      <Icon :icon="getFacilityIcon(fac.name)" width="14" />
                      {{ fac.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="sidebar-section">
          
          <div class="card owner-card">
            <h3 class="card-title">
              <Icon icon="mdi:account-circle" />
              Pemilik Properti
            </h3>
            <div class="owner-profile">
              <div class="avatar">
                {{ getInitials(kost.user?.name || kost.owner?.name) }}
              </div>
              <div class="owner-info">
                <div class="owner-name">{{ kost.user?.name || kost.owner?.name || 'Pemilik Kost' }}</div>
                <div class="owner-role">Owner/Landlord</div>
              </div>
            </div>

            <div class="owner-contacts">
              <div class="contact-item">
                <Icon icon="mdi:email" />
                <div>
                  <span class="contact-label">Email</span>
                  <span class="contact-value">{{ kost.user?.email || kost.owner?.email || '-' }}</span>
                </div>
              </div>
              <div v-if="kost.user?.phone_whatsapp || kost.owner?.phone_whatsapp" class="contact-item">
                <Icon icon="mdi:whatsapp" />
                <div>
                  <span class="contact-label">WhatsApp</span>
                  <span class="contact-value">{{ kost.user?.phone_whatsapp || kost.owner?.phone_whatsapp }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card stats-card">
            <h3 class="card-title">
              <Icon icon="mdi:chart-box" />
              Statistik 
            </h3>

            <div class="stat-item">
              <Icon icon="mdi:eye" class="stat-icon" />
              <div>
                <span class="stat-label">Total Views </span>
                <span class="stat-value">{{ kost.views || 0 }}</span>
              </div>
            </div>

            <div class="stat-item">
              <Icon icon="mdi:heart" class="stat-icon" />
              <div>
                <span class="stat-label">Wishlist </span>
                <span class="stat-value">{{ kost.wishlist_count || 0 }}</span>
              </div>
            </div>

            <div class="stat-item">
              <Icon icon="mdi:star" class="stat-icon" />
              <div>
                <span class="stat-label">Rating </span>
                <span class="stat-value">{{ kost.rating || '0.0' }} / 5.0</span>
              </div>
            </div>
          </div>

          <div class="card timeline-card">
            <h3 class="card-title">
              <Icon icon="mdi:clock-outline" />
              Timeline 
            </h3>

            <div class="timeline-list">
              <div class="timeline-item">
                <div class="timeline-icon">
                  <Icon icon="mdi:calendar-plus" />
                </div>
                <div class="timeline-content">
                  <span class="timeline-label">Dibuat </span>
                  <span class="timeline-date">{{ formatDateFull(kost.created_at) }}</span>
                </div>
              </div>

              <div v-if="kost.verified_at" class="timeline-item">
                <div class="timeline-icon verified">
                  <Icon icon="mdi:check-decagram" />
                </div>
                <div class="timeline-content">
                  <span class="timeline-label">Diverifikasi </span>
                  <span class="timeline-date">{{ formatDateFull(kost.verified_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card action-card">
            <h3 class="card-title">
              <Icon icon="mdi:gavel" />
              Keputusan Admin
            </h3>

            <div v-if="!kost.is_verified" class="action-buttons">
              <BaseButton 
                variant="primary" 
                block 
                size="lg" 
                :loading="processing"
                @click="handleApprove"
              >
                <template #icon-left><Icon icon="mdi:check-decagram" /></template>
                Setujui & Tayangkan
              </BaseButton>

              <p class="action-note">
                <Icon icon="mdi:information" width="16" />
                Properti akan langsung tayang ke publik setelah disetujui
              </p>
            </div>

            <div v-else class="verified-stamp">
              <Icon icon="mdi:shield-check" width="48" />
              <span class="stamp-text">Sudah Terverifikasi</span>
              <span class="stamp-date">{{ formatDateFull(kost.verified_at) }}</span>
            </div>
          </div>

        </div>

      </div>

      <div v-else class="error-state">
        <div class="error-card">
          <Icon icon="mdi:home-alert" width="64" />
          <h3>Data Tidak Ditemukan</h3>
          <BaseButton variant="outline" @click="goBack" class="mt-4">
            <template #icon-left><Icon icon="mdi:arrow-left" /></template>
            Kembali Ke Daftar
          </BaseButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import adminService from '@/services/adminService';
import { notify } from '@/utils/swal';

const route = useRoute();
const router = useRouter();

const kost = ref(null);
const loading = ref(true);
const processing = ref(false);
const error = ref(null);

const BASE_STORAGE_URL = 'https://kodyakostapi.adityavisual.my.id';

const getStorageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${BASE_STORAGE_URL}/storage/${path.replace(/^\//, '')}`;
};

const getFacilityIcon = (facilityName) => {
  const map = { wifi: 'mdi:wifi', ac: 'mdi:air-conditioner', parkir: 'mdi:parking', 'kamar mandi': 'mdi:shower' };
  return map[facilityName.toLowerCase().trim()] || 'mdi:check-circle';
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
const formatDateFull = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
const goBack = () => router.push({ name: 'admin-verification' });

const getWaitingDuration = () => {
  if (!kost.value?.created_at) return '';
  const diffDays = Math.floor((new Date() - new Date(kost.value.created_at)) / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 'Hari ini' : `${diffDays} hari yang lalu`;
};

const allFacilities = computed(() => {
  if (!kost.value?.rooms?.length) return [];
  const set = new Set();
  kost.value.rooms.forEach(r => r.facilities?.forEach(f => set.add(f.name)));
  return Array.from(set);
});

const fetchDetail = async () => {
  loading.value = true;
  try {
    kost.value = await adminService.getKostDetail(route.params.id);
  } catch (err) {
    error.value = "Gagal mengambil detail kost.";
  } finally {
    loading.value = false;
  }
};

const handleApprove = async () => {
  const confirmed = await notify.confirm("Setujui Properti?", `Terbitkan "${kost.value.name}"?`);
  if (!confirmed) return;
  processing.value = true;
  try {
    await adminService.verifyKost(kost.value.id);
    notify.alertSuccess("Berhasil!", "Properti telah aktif.");
    goBack();
  } catch (err) {
    notify.error("Gagal memproses verifikasi.");
  } finally {
    processing.value = false;
  }
};

onMounted(fetchDetail);
</script>

<style scoped>
/* STYLE ASLI 100% DIBAWAH INI */
.detail-page { padding: 2rem 1rem; background: #f8fafc; min-height: 100vh; font-family: 'Poppins', sans-serif; }
.container { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0; }
.header-status { display: flex; align-items: center; gap: 10px; }
.status-label { font-size: 0.9rem; color: #64748b; font-weight: 600; }
.status-badge { padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.status-badge.pending { background: #fff7ed; color: #c2410c; border: 2px solid #ffedd5; }
.status-badge.approved { background: #f0fdf4; color: #16a34a; border: 2px solid #dcfce7; }
.content-wrapper { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
.card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 20px; }
.card-title { font-size: 1.2rem; font-weight: 700; color: #1e3a8a; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; }
.gallery-grid { display: grid; gap: 12px; }
.main-photo { position: relative; width: 100%; height: 400px; border-radius: 12px; overflow: hidden; background: #f1f5f9; border: 2px solid #e2e8f0; }
.main-photo img { width: 100%; height: 100%; object-fit: cover; }
.photo-label { position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.75); color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.room-photos, .additional-photos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.photo-item { position: relative; height: 140px; border-radius: 10px; overflow: hidden; background: #f1f5f9; border: 1px solid #e2e8f0; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; }
.info-row { padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
.info-label { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; font-size: 0.9rem; margin-bottom: 6px; }
.info-value { color: #1e293b; font-size: 0.95rem; line-height: 1.6; }
.location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.location-item { display: flex; gap: 12px; padding: 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
.location-item .label { display: block; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
.location-item .value { display: block; font-weight: 600; color: #1e293b; }
.coordinate-box { background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 16px; }
.btn-map { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: #1e3a8a; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.facilities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.facility-item { display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.room-detail-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 15px; }
.room-header { display: flex; gap: 16px; margin-bottom: 16px; }
.room-image { width: 120px; height: 90px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.room-image img { width: 100%; height: 100%; object-fit: cover; }
.room-type { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
.room-price { color: #059669; font-weight: 700; }
.room-details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
.room-detail-item { display: flex; gap: 10px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
.room-fac-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.fac-tag { background: #eff6ff; color: #1e40af; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.owner-profile { display: flex; gap: 14px; margin-bottom: 18px; }
.avatar { width: 60px; height: 60px; background: #1e3a8a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.contact-item { display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px; }
.timeline-list { display: flex; flex-direction: column; gap: 16px; }
.timeline-item { display: flex; gap: 12px; }
.timeline-icon { width: 40px; height: 40px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e3a8a; }
.timeline-icon.verified { background: #f0fdf4; color: #16a34a; }
.action-note { font-size: 0.85rem; color: #64748b; margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; display: flex; gap: 8px; }
.verified-stamp { display: flex; flex-direction: column; align-items: center; padding: 24px; background: #f0fdf4; border: 3px solid #86efac; border-radius: 12px; }
.stamp-text { font-weight: 700; color: #16a34a; margin-top: 10px; }

/* ✅ LOADING STATE CSS */
.loading-state-container { padding: 24px; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; }
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }

.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; }
.error-card { background: white; padding: 3rem; border-radius: 20px; text-align: center; border: 2px dashed #e2e8f0; }

@media (max-width: 1024px) {
  .content-wrapper { grid-template-columns: 1fr; }
  .sidebar-section { order: 2; }
}
</style>