<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router'; 
import { Icon } from '@iconify/vue';
import { notify } from '@/utils/swal';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import SuccessModal from '@/components/modal/SuccessModal.vue'; 

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); 

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const showSuccessModal = ref(false);
const currentRole = ref('tenant'); 

const togglePassword = () => { showPassword.value = !showPassword.value; };

const handleLogin = async () => {
  authStore.error = null;
  const isSuccess = await authStore.login(email.value, password.value, currentRole.value);

  if (isSuccess) {
    showSuccessModal.value = true;
    
    setTimeout(() => {
      showSuccessModal.value = false;
      
      // Ambil path redirect dari query params (?redirect=/tenant/dashboard)
      const redirectPath = route.query.redirect;
      
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        // Redirect ke Nama Route yang ada di index.js kamu
        if (authStore.isAdmin) router.push({ name: 'admin-dashboard' });
        else if (authStore.isOwner) router.push({ name: 'owner-dashboard' });
        else router.push({ name: 'tenant-dashboard' });
      }
    }, 1500);
  }
};

onMounted(() => {
  authStore.error = null;
  if (route.query.role) currentRole.value = route.query.role;
});
</script>

<template>
  <div class="login-container">
    <div class="image-section">
      <div class="overlay"></div>
      <img src="@/assets/images/room.jpg" alt="Bedroom Interior" />
      <div class="image-text">
        <h2>Welcome Back!</h2>
        <p>Manage your property or find your dream stay with KodyaKost.</p>
      </div>
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        <div class="header">
          <h1>Sign In</h1>
          <p>Enter your details to access your account as {{ currentRole }}</p>
        </div>

        <div class="form-card">
          <form @submit.prevent="handleLogin">
            <BaseInput 
              v-model="email"
              label="Email"
              type="email"
              placeholder="Masukkan email anda"
              required
              :disabled="authStore.loading"
              :error="authStore.error"
            />

            <BaseInput 
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan kata sandi"
              required
              :disabled="authStore.loading"
            >
              <template #append>
                <button type="button" class="eye-btn" @click="togglePassword">
                  <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                </button>
              </template>
            </BaseInput>

            <div class="forgot-password">
              <a href="#">Forgot password?</a>
            </div>

            <BaseButton 
              type="submit" 
              variant="primary" 
              block 
              :loading="authStore.loading"
            >
              Continue
            </BaseButton>
          </form>

          <div class="divider">
            <div class="line"></div>
            <span>Or continue with</span>
            <div class="line"></div>
          </div>

          <BaseButton variant="google" block @click="notify.success('Segera Hadir!')">
            <template #icon-left><Icon icon="logos:google-icon" /></template>
            Sign in with Google
          </BaseButton>

          <div class="footer-text">
            Don't have an account? 
            <router-link :to="{ path: '/register', query: { role: currentRole } }">Sign up now</router-link>
          </div>
        </div>
      </div>
    </div>
    
    <SuccessModal :isOpen="showSuccessModal" title="Login Successful!" message="You are being redirected..." />
  </div>
</template>

<style scoped>
/* Style Anda tetap dipertahankan */
.login-container { display: flex; min-height: 100vh; width: 100%; background-color: #ffffff; }
.image-section { display: none; width: 50%; position: relative; overflow: hidden; }
@media (min-width: 1024px) { .image-section { display: block; } }
.image-section img { width: 100%; height: 100%; object-fit: cover; }
.image-section .overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 137, 123, 0.3), rgba(0, 105, 92, 0.5)); z-index: 1; }
.form-section { width: 100%; display: flex; align-items: center; justify-content: center; padding: 2rem; background-color: #fafafa; }
@media (min-width: 1024px) { .form-section { width: 50%; } }
.form-wrapper { width: 100%; max-width: 500px; }
.form-card { background: #ffffff; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); }
.eye-btn { background: none; border: none; cursor: pointer; color: #757575; display: flex; align-items: center; }
.forgot-password { text-align: right; margin-bottom: 1.5rem; }
.forgot-password a { color: #00897b; font-size: 0.875rem; text-decoration: none; font-weight: 500; }
.divider { display: flex; align-items: center; margin: 1.75rem 0; color: #9e9e9e; font-size: 0.8rem; }
.divider .line { flex: 1; height: 1px; background-color: #e0e0e0; }
.divider span { padding: 0 1rem; }
.footer-text { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: #666666; }
.footer-text a { color: #00897b; font-weight: 600; text-decoration: none; }
</style>