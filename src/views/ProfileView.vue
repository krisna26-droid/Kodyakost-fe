<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';
import { notify } from '@/utils/swal';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

// Konfigurasi URL Dinamis
const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=random';

// State UI
const isEditing = ref(false);
const loading = ref(false); 
const fileInput = ref(null);
const selectedFile = ref(null);
const previewAvatar = ref(null);

// State KTP
const ktpFileInput = ref(null);
const selectedKtpFile = ref(null);
const previewKtp = ref(null);

// State Form
const form = ref({
  name: '',
  email: '',
  phone: ''
});

// Helper URL
const getAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_STORAGE_URL}/storage/${path.replace(/^\//, '')}`;
};

const getKtpUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_STORAGE_URL}/storage/${path.replace(/^\//, '')}`;
};

const resetForm = () => {
  if (user.value) {
    form.value.name = user.value.name || '';
    form.value.email = user.value.email || '';
    form.value.phone = user.value.phone_whatsapp || '';
  }
};

// Handlers Media
const triggerFileInput = () => { 
  isEditing.value = true; 
  fileInput.value.click(); 
};

const triggerKtpInput = () => { 
  // ⚠️ Cek role dulu sebelum upload
  if (user.value?.role !== 'tenant') {
    notify.error('Fitur upload KTP hanya tersedia untuk Pencari Kos (tenant)');
    return;
  }
  
  if (!isEditing.value) isEditing.value = true;
  ktpFileInput.value.click(); 
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
    notify.success("Foto profil dipilih!");
  }
};

const handleKtpChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validasi file
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      notify.error('Format file harus JPG atau PNG!');
      event.target.value = '';
      return;
    }
    
    if (file.size > maxSize) {
      notify.error('Ukuran file maksimal 2MB!');
      event.target.value = '';
      return;
    }
    
    selectedKtpFile.value = file;
    previewKtp.value = URL.createObjectURL(file);
    notify.success("Foto KTP dipilih!");
  }
};

// ✅ SIMPAN DATA PROFILE & KTP
const handleSaveProfile = async () => {
  loading.value = true;
  
  try {
    let profileSuccess = true;
    let ktpSuccess = true;

    // --- TAHAP 1: UPDATE PROFIL UMUM ---
    const hasProfileChanges = 
      form.value.name !== user.value?.name ||
      form.value.phone !== user.value?.phone_whatsapp ||
      selectedFile.value;

    if (hasProfileChanges) {
      const profileData = new FormData();
      profileData.append('name', form.value.name);
      profileData.append('phone_whatsapp', form.value.phone);
      if (selectedFile.value) profileData.append('avatar', selectedFile.value);

      profileSuccess = await authStore.updateProfile(profileData);
      
      if (!profileSuccess) {
        notify.error(authStore.error || "Gagal memperbarui profil!");
        loading.value = false;
        return;
      }
    }

    // --- TAHAP 2: UPLOAD KTP ---
    if (selectedKtpFile.value) {
      // ⚠️ Cek role lagi sebelum upload
      if (user.value?.role !== 'tenant') {
        notify.error('Fitur upload KTP hanya tersedia untuk Pencari Kos (tenant)');
        loading.value = false;
        return;
      }
      
      console.log('🔄 Uploading KTP...');
      console.log('User role:', user.value?.role);
      console.log('File:', selectedKtpFile.value.name);
      
      const ktpData = new FormData();
      ktpData.append('ktp_image', selectedKtpFile.value); 
      
      ktpSuccess = await authStore.uploadKtp(ktpData);
      
      if (!ktpSuccess) {
        const errorMsg = authStore.error || "Gagal upload KTP!";
        
        // Berikan info lebih jelas untuk error 404
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          notify.error('Route upload KTP tidak ditemukan. Pastikan backend sudah running dan route sudah di-clear cache.');
        } else {
          notify.error(errorMsg);
        }
        
        loading.value = false;
        return;
      }
    }

    // ✅ Semua berhasil
    if (profileSuccess && ktpSuccess) {
      notify.success("Profil berhasil diperbarui!");
      isEditing.value = false;
      
      // Bersihkan state temporary
      selectedFile.value = null;
      selectedKtpFile.value = null;
      previewAvatar.value = null;
      previewKtp.value = null;
      
      // Reset file input
      if (fileInput.value) fileInput.value.value = '';
      if (ktpFileInput.value) ktpFileInput.value.value = '';
    }
  } catch (error) {
    console.error("Save profile error:", error);
    notify.error("Terjadi kesalahan saat menyimpan data.");
  } finally {
    loading.value = false;
  }
};

const cancelEdit = async () => {
  const yakin = await notify.confirm("Batalkan perubahan?", "Data yang sudah diubah tidak akan disimpan.");
  if (yakin) {
    isEditing.value = false;
    resetForm();
    previewAvatar.value = null;
    previewKtp.value = null;
    selectedFile.value = null;
    selectedKtpFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    if (ktpFileInput.value) ktpFileInput.value.value = '';
  }
};

// Debug pada mount
onMounted(() => { 
  resetForm();
  console.log('👤 User Info:', {
    role: user.value?.role,
    name: user.value?.name,
    isTenant: user.value?.role === 'tenant'
  });
});

watch(user, () => resetForm());
</script>

<template>
  <div class="profile-view">
    <div class="container">
      <div class="page-header">
        <BaseButton variant="ghost" size="sm" @click="$router.back()" rounded="full">
          <template #icon-left><Icon icon="mdi:arrow-left" /></template>
          Kembali
        </BaseButton>
        <h1>Profil Saya</h1>
      </div>

      <div class="profile-grid">
        <div class="profile-card identity-card">
          <div class="avatar-wrapper">
            <img 
              :src="previewAvatar || getAvatarUrl(user?.avatar) || defaultAvatar" 
              class="avatar-img"
              alt="Avatar"
            />
            <button 
              class="edit-avatar-btn" 
              @click="triggerFileInput" 
              title="Ubah Foto"
              :disabled="!isEditing"
            >
              <Icon icon="mdi:camera" />
            </button>
            <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*" />
          </div>
          <h2 class="user-name">{{ user?.name }}</h2>
          <span class="user-role">{{ user?.role === 'owner' ? 'Pemilik' : 'Pencari' }}</span>
        </div>

        <div class="content-column">
          <div class="profile-card form-card">
            <div class="card-header">
              <h3>Informasi Pribadi</h3>
              <BaseButton v-if="!isEditing" variant="outline" size="sm" @click="isEditing = true">
                <template #icon-left><Icon icon="pencil" /></template>
                Edit Profil
              </BaseButton>
            </div>

            <form @submit.prevent="handleSaveProfile">
              <div class="form-grid">
                <BaseInput v-model="form.name" label="Nama Lengkap" :disabled="!isEditing" required />
                
                <BaseInput v-model="form.email" label="Email" disabled>
                  <template #append><Icon icon="mdi:lock" /></template>
                </BaseInput>
                
                <BaseInput v-model="form.phone" label="Nomor WhatsApp" type="tel" :disabled="!isEditing" required />
                
                <!-- ⚠️ KTP HANYA UNTUK TENANT -->
                <div class="form-group full" v-if="user?.role === 'tenant'">
                  <label>
                    Foto KTP 
                  </label>
                  <div 
                    class="ktp-box" 
                    @click="isEditing ? triggerKtpInput() : null"
                    :class="{ 'disabled': !isEditing }"
                  >
                    <img 
                      v-if="previewKtp || user?.ktp_image" 
                      :src="previewKtp || getKtpUrl(user?.ktp_image)" 
                      class="ktp-img" 
                      alt="KTP" 
                    />
                    <div v-else class="ktp-placeholder">
                      <Icon icon="mdi:card-account-details-outline" />
                      <p>{{ isEditing ? 'Klik untuk upload KTP' : 'Belum ada KTP' }}</p>
                      <small>Format: JPG/PNG, Maks 2MB</small>
                    </div>
                    <input type="file" ref="ktpFileInput" class="hidden" @change="handleKtpChange" accept="image/jpeg,image/jpg,image/png" />
                  </div>
                </div>
              </div>

              <div v-if="isEditing" class="action-buttons">
                <BaseButton type="button" variant="ghost" @click="cancelEdit" :disabled="loading">
                  Batal
                </BaseButton>
                <BaseButton type="submit" variant="primary" :loading="loading">
                  Simpan Perubahan
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view { background: #f9fafb; min-height: 100vh; padding: 2rem 0; font-family: 'Poppins', sans-serif; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 1rem; }
.page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.page-header h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }

.profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
.profile-card { background: #fff; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.identity-card { text-align: center; height: fit-content; }

.avatar-wrapper { position: relative; width: 120px; height: 120px; margin: 0 auto 1rem; }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid #00897b; }
.edit-avatar-btn { 
  position: absolute; 
  bottom: 0; 
  right: 0; 
  background: #00897b; 
  color: #fff; 
  border: none; 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s;
}
.edit-avatar-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.user-name { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
.user-role { font-size: 0.875rem; color: #64748b; font-weight: 500; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.card-header h3 { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
.full { grid-column: span 2; }
.hidden { display: none; }

.ktp-box { 
  border: 2px dashed #e2e8f0; 
  border-radius: 0.75rem; 
  height: 200px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  overflow: hidden; 
  transition: all 0.2s; 
  background: #f8fafc; 
}
.ktp-box:not(.disabled):hover { 
  border-color: #00897b; 
  background: #f0fdfa; 
}
.ktp-box.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.ktp-img { width: 100%; height: 100%; object-fit: contain; }
.ktp-placeholder { text-align: center; color: #94a3b8; }
.ktp-placeholder svg { font-size: 2.5rem; margin-bottom: 0.5rem; }
.ktp-placeholder p { font-size: 0.875rem; margin: 0.5rem 0; }
.ktp-placeholder small { font-size: 0.75rem; color: #94a3b8; }

.verified { 
  color: #059669; 
  font-size: 0.75rem; 
  background: #ecfdf5; 
  padding: 2px 10px; 
  border-radius: 1rem; 
  margin-left: 0.5rem; 
  border: 1px solid #d1fae5; 
}

.pending {
  color: #d97706;
  font-size: 0.75rem;
  background: #fef3c7;
  padding: 2px 10px;
  border-radius: 1rem;
  margin-left: 0.5rem;
  border: 1px solid #fde68a;
}

.action-buttons { 
  display: flex; 
  justify-content: flex-end; 
  gap: 1rem; 
  margin-top: 2rem; 
  padding-top: 1.5rem; 
  border-top: 1px solid #f1f5f9; 
}

@media (max-width: 768px) { 
  .profile-grid { grid-template-columns: 1fr; } 
  .form-grid { grid-template-columns: 1fr; } 
  .full { grid-column: span 1; }
}
</style>