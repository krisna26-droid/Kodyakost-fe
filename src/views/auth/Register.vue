<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router'; 
import { Icon } from '@iconify/vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import SuccessModal from '@/components/modal/SuccessModal.vue'; 

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); 

// State Management
const role = ref('tenant'); 
const fullName = ref('');
const phoneNumber = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const agreeToTerms = ref(false);
const showSuccessModal = ref(false);
const isSubmitting = ref(false);

// Untuk menyimpan referensi timeout agar tidak terjadi memory leak/error unmount
let redirectTimer = null;

const handleSignUp = async () => {
  // 1. Validasi lokal sederhana
  if (password.value !== confirmPassword.value) {
    authStore.error = 'Passwords do not match!';
    return;
  }

  isSubmitting.value = true;
  authStore.error = null; // Reset error sebelum mulai

  try {
    // 2. Proses Registrasi
    const isSuccess = await authStore.register({
      name: fullName.value,
      email: email.value,
      password: password.value,
      role: role.value,
      phone: phoneNumber.value
    });

    if (isSuccess) {
      showSuccessModal.value = true;
      
      // 3. Redirect aman dengan pembersihan timer
      redirectTimer = setTimeout(() => {
        // Cek apakah modal masih terbuka sebelum menutupnya (mencegah unmount error)
        showSuccessModal.value = false;
        router.push({ 
          path: '/login', 
          query: { role: role.value, registered: 'true' } 
        });
      }, 2000);
    }
  } catch (err) {
    console.error("Registration Error:", err);
    authStore.error = "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle Hooks
onMounted(() => {
  authStore.error = null;
  // Ambil role dari URL query jika ada
  if (route.query.role) {
    role.value = route.query.role;
  }
});

onUnmounted(() => {
  // PENTING: Bersihkan timer jika user pindah halaman sebelum timeout selesai
  if (redirectTimer) {
    clearTimeout(redirectTimer);
  }
});
</script>

<template>
  <div class="signup-container">
    <div class="image-section">
      <div class="overlay"></div>
      <img src="@/assets/images/room.jpg" alt="Bedroom Interior" />
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        <div class="header">
          <h1>Sign Up</h1>
          <p>Registering as <span class="role-text">{{ role }}</span></p>
        </div>

        <div class="form-card">
          <form @submit.prevent="handleSignUp">
            <BaseInput v-model="fullName" label="Full Name" placeholder="Nama Lengkap" required :error="authStore.error" />
            <BaseInput v-model="phoneNumber" label="Phone Number" type="tel" placeholder="Nomor WhatsApp" required />
            <BaseInput v-model="email" label="Email" type="email" placeholder="Email aktif" required />
            
            <BaseInput v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" placeholder="Min 8 karakter" required>
              <template #append>
                <button type="button" @click="showPassword = !showPassword">
                  <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                </button>
              </template>
            </BaseInput>

            <BaseInput v-model="confirmPassword" label="Confirm Password" type="password" placeholder="Ulangi password" required />

            <div class="checkbox-group">
              <input v-model="agreeToTerms" type="checkbox" id="terms" required />
              <label for="terms">I agree to the <a href="#">Terms & Conditions</a></label>
            </div>

            <BaseButton type="submit" variant="primary" block :loading="authStore.loading" :disabled="!agreeToTerms">
              Create Account
            </BaseButton>
          </form>

          <div class="footer-text">
            Already have an account? <router-link :to="{ path: '/login', query: { role: role } }">Sign in here</router-link>
          </div>
        </div>
      </div>
    </div>
    <SuccessModal :isOpen="showSuccessModal" title="Account Created!" message="Success! Redirecting to login..." />
  </div>
</template>

<style scoped>
.signup-container { display: flex; min-height: 100vh; width: 100%; background-color: #ffffff; }
.image-section { display: none; width: 50%; position: relative; overflow: hidden; }
@media (min-width: 1024px) { .image-section { display: block; } }
.image-section img { width: 100%; height: 100%; object-fit: cover; }
.image-section .overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 137, 123, 0.3), rgba(0, 105, 92, 0.5)); z-index: 1; }
.form-section { width: 100%; display: flex; align-items: center; justify-content: center; padding: 2rem; background-color: #fafafa; }
@media (min-width: 1024px) { .form-section { width: 50%; } }
.form-wrapper { width: 100%; max-width: 500px; }
.form-card { background: #ffffff; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); }
.role-text { color: #00897b; font-weight: 700; text-transform: capitalize; }
.checkbox-group { display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; font-size: 0.875rem; }
.footer-text { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #666666; }
.footer-text a { color: #00897b; font-weight: 600; text-decoration: none; }
</style>