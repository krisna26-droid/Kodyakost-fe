<template>
  <div class="profile-view">
    <div class="container">
      
      <div class="page-header">
        <button @click="$router.back()" class="back-btn">
          <Icon icon="mdi:arrow-left" /> Kembali
        </button>
        <h1>Profil Saya</h1>
      </div>

      <div class="profile-grid">
        
        <div class="profile-card identity-card">
          <div class="avatar-wrapper">
            <img 
              :src="previewAvatar || getAvatarUrl(user?.avatar) || defaultAvatar" 
              @error="handleImageError"
              alt="User Avatar" 
              class="avatar-img"
            />
            
            <button class="edit-avatar-btn" @click="triggerFileInput" title="Ubah Foto">
              <Icon icon="mdi:camera" />
            </button>
            
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden-input" 
              @change="handleFileChange" 
              accept="image/png, image/jpeg, image/jpg" 
            />
          </div>

          <h2 class="user-name">{{ user?.name || 'Pengguna' }}</h2>
          <span class="user-role">{{ formatRole(user?.role) }}</span>

          <div class="joined-date">
            <Icon icon="mdi:calendar-blank" />
            <span>Bergabung sejak {{ formatDate(user?.created_at) }}</span>
          </div>
        </div>

        <div class="content-column">
          
          <div class="profile-card form-card">
            <div class="card-header">
              <h3>Informasi Pribadi</h3>
              <button 
                v-if="!isEditing" 
                @click="enableEdit" 
                class="edit-btn"
              >
                <Icon icon="mdi:pencil" /> Edit Profil
              </button>
            </div>

            <form @submit.prevent="handleSaveProfile">
              <div class="form-grid">
                
                <div class="form-group">
                  <label>Nama Lengkap</label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    :disabled="!isEditing"
                    :class="{ 'editable': isEditing }"
                    placeholder="Nama Lengkap"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <div class="input-wrapper locked">
                    <input 
                      v-model="form.email" 
                      type="email" 
                      disabled
                      title="Email tidak dapat diubah"
                    />
                    <Icon icon="mdi:lock" class="lock-icon" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Nomor WhatsApp</label>
                  <input 
                    v-model="form.phone" 
                    type="tel" 
                    :disabled="!isEditing"
                    :class="{ 'editable': isEditing }"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>

                <div class="form-group full-width">
                  <label>Bio Singkat</label>
                  <textarea 
                    v-model="form.bio" 
                    rows="3"
                    :disabled="!isEditing"
                    :class="{ 'editable': isEditing }"
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  ></textarea>
                </div>

              </div>

              <div v-if="isEditing" class="action-buttons">
                <button type="button" class="btn-cancel" @click="cancelEdit">Batal</button>
                <button 
                  type="submit" 
                  class="btn-save" 
                  :disabled="authStore.loading"
                >
                  <Icon v-if="authStore.loading" icon="mdi:loading" class="spin" />
                  {{ authStore.loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </form>
          </div>

          <div class="profile-card security-card">
            <div class="card-header">
              <h3>Keamanan Akun</h3>
            </div>
            <div class="password-row">
              <div class="pass-info">
                <label>Password</label>
                <p>••••••••••••</p>
              </div>
              <button type="button" class="change-pass-btn">Ubah Password</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

// --- KONFIGURASI URL BACKEND (PENTING!) ---
// Jika pakai php artisan serve -> 'http://127.0.0.1:8000'
// Jika pakai Laragon -> biasanya 'http://kodyakost-api.test' atau 'http://localhost/kodyakost-api/public'
// Cek browser kamu saat buka API, copy base URL-nya ke sini:
const API_BASE_URL = 'http://127.0.0.1:8000'; 

const defaultAvatar = 'https://i.pravatar.cc/150?img=11';

// State UI
const isEditing = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const previewAvatar = ref(null);

// State Form
const form = ref({
  name: '',
  email: '',
  phone: '',
  bio: ''
});

// --- HELPER METHODS ---

// 1. Generate URL Avatar yang Benar
const getAvatarUrl = (path) => {
  if (!path) return null;
  // Jika path sudah ada http-nya (misal dari Google), pakai langsung
  if (path.startsWith('http')) return path;
  
  // Bersihkan path (hilangkan slash di depan jika ada)
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Gabungkan Base URL + folder storage + path dari DB
  const fullUrl = `${API_BASE_URL}/storage/${cleanPath}`;
  
  // Debugging: Cek di Console Browser (F12) > Console
  // console.log("Generated Avatar URL:", fullUrl); 
  
  return fullUrl;
};

// 2. Handle Error (Kalau gambar 404, ganti ke default)
const handleImageError = (e) => {
  // Cegah loop (kalau default juga error)
  if (e.target.src !== defaultAvatar) {
    e.target.src = defaultAvatar;
  }
};

const formatRole = (role) => (role === 'owner' ? 'Pemilik Properti' : 'Pencari Kost');

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

// 3. Reset Form
const resetForm = () => {
  if (user.value) {
    form.value.name = user.value.name || '';
    form.value.email = user.value.email || '';
    form.value.phone = user.value.phone_whatsapp || '';
    form.value.bio = user.value.bio || ''; 
  }
};

// --- HANDLERS ---

const triggerFileInput = () => {
  isEditing.value = true;
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewAvatar.value = URL.createObjectURL(file); // Tampilkan preview lokal
  }
};

const enableEdit = () => { isEditing.value = true; };

const cancelEdit = () => {
  isEditing.value = false;
  selectedFile.value = null;
  previewAvatar.value = null; 
  resetForm(); 
};

const handleSaveProfile = async () => {
  const formData = new FormData();
  formData.append('name', form.value.name);
  formData.append('phone_whatsapp', form.value.phone);
  
  if (selectedFile.value) {
    formData.append('avatar', selectedFile.value);
  }

  const success = await authStore.updateProfile(formData);

  if (success) {
    alert("Profil berhasil diperbarui!");
    isEditing.value = false;
    selectedFile.value = null;
    previewAvatar.value = null; // Hapus preview, pakai data user yang baru
  } else {
    alert("Gagal: " + (authStore.error || "Terjadi kesalahan server"));
  }
};

onMounted(() => {
  if (!user.value) {
    authStore.fetchUser();
  }
  resetForm();
});

watch(user, () => {
  resetForm();
});
</script>

<style scoped>
/* --- STYLES SAMA SEPERTI SEBELUMNYA --- */
.profile-view {
  background-color: #f3f4f6;
  min-height: 100vh;
  padding: 40px 0;
  font-family: 'Poppins', sans-serif;
  color: #333;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* HEADER */
.page-header {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.page-header h1 { font-size: 1.8rem; font-weight: 700; color: #1f3a52; }

.back-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  transition: all 0.2s;
}
.back-btn:hover { background: #e5e7eb; }

/* GRID LAYOUT */
.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

/* CARDS COMMON STYLE */
.profile-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}

/* IDENTITY CARD (LEFT) */
.identity-card {
  text-align: center;
  height: fit-content;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0fbfb;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fca311;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.edit-avatar-btn:hover { transform: scale(1.1); }
.hidden-input { display: none; }

.user-name { font-size: 1.4rem; font-weight: 700; color: #1f3a52; margin-bottom: 5px; }
.user-role { 
  display: inline-block; 
  background: #e0f2fe; 
  color: #0369a1; 
  padding: 5px 12px; 
  border-radius: 20px; 
  font-size: 0.85rem; 
  font-weight: 600; 
  margin-bottom: 20px;
}

.joined-date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

/* FORM CARD (RIGHT) */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.card-header h3 { font-size: 1.2rem; font-weight: 700; color: #1f3a52; }

.edit-btn {
  background: none;
  border: 1px solid #fca311;
  color: #fca311;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.edit-btn:hover { background: #fff8e6; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group.full-width { grid-column: span 2; }

.form-group label { font-size: 0.9rem; font-weight: 600; color: #4b5563; }

input, textarea {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f9fafb;
  color: #1f3a52;
  transition: all 0.2s;
  font-family: inherit;
}

/* State: Editable */
input.editable, textarea.editable {
  background: white;
  border-color: #cbd5e1;
}
input.editable:focus, textarea.editable:focus {
  border-color: #fca311;
  outline: none;
  box-shadow: 0 0 0 3px rgba(252, 163, 17, 0.1);
}

/* State: Locked/Disabled */
.input-wrapper.locked { position: relative; }
.input-wrapper.locked input { padding-right: 40px; cursor: not-allowed; opacity: 0.7; }
.lock-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

/* Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
}

.btn-save {
  background: #1f3a52;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-save:disabled { background: #94a3b8; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* SECURITY CARD */
.security-card { margin-top: 30px; }

.password-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}
.pass-info label { font-size: 0.9rem; font-weight: 600; color: #4b5563; }
.pass-info p { letter-spacing: 2px; color: #9ca3af; margin-top: 5px; }

.change-pass-btn {
  background: #f3f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  color: #1f3a52;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.change-pass-btn:hover { background: #e5e7eb; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full-width { grid-column: span 1; }
  .action-buttons { flex-direction: column-reverse; }
  .btn-cancel, .btn-save { width: 100%; justify-content: center; }
}
</style>