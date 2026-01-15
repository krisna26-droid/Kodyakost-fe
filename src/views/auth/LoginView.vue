<template>
  <div class="login-container">
    
    <div class="image-section">
      <div class="overlay"></div>
      <img 
        src="@/assets/images/room.jpg" 
        alt="Bedroom Interior" 
      />
      <div class="image-text">
        <h2>Welcome Back!</h2>
        <p>Manage your property or find your dream stay with KodyaKost.</p>
      </div>
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        
        <div class="header">
          <h1>Sign In</h1>
          <p>Enter your details to access your account</p>
        </div>

        <div class="form-card">
          
          <form @submit.prevent="handleLogin">
            
            <div class="input-group">
              <label>Email <span class="required">*</span></label>
              <input 
                v-model="email"
                type="email" 
                placeholder="Masukan email anda"
                required
                autocomplete="username"
                :disabled="authStore.loading"
              />
            </div>

            <div class="input-group">
              <label>Password <span class="required">*</span></label>
              <div class="password-wrapper">
                <input 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Masukan kata sandi"
                  required
                  autocomplete="current-password"
                  :disabled="authStore.loading"
                />
                <button type="button" class="eye-btn" @click="togglePassword">
                  <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                </button>
              </div>
            </div>

            <div class="forgot-password">
              <a href="#">Forgot password?</a>
            </div>

            <div v-if="authStore.error" class="error-alert">
              <Icon icon="mdi:alert-circle" class="error-icon" />
              <span>{{ authStore.error }}</span>
              <button type="button" @click="clearError" class="close-btn">
                <Icon icon="mdi:close" />
              </button>
            </div>

            <button 
              type="submit" 
              class="btn-continue" 
              :disabled="authStore.loading"
              :class="{ 'loading': authStore.loading }"
            >
              <span v-if="authStore.loading"><Icon icon="mdi:loading" class="spin" /> Signing in...</span>
              <span v-else>Continue</span>
            </button>
          </form>

          <div class="divider">
            <div class="line"></div>
            <span>Or continue with</span>
            <div class="line"></div>
          </div>

          <button class="btn-google" @click="handleGoogleLogin">
            <Icon icon="logos:google-icon" />
            Sign in with Google
          </button>

          <div class="footer-text">
            Don't have an account? 
            <router-link :to="{ path: '/register', query: { role: currentRole } }">
              Sign up now
            </router-link>
          </div>

        </div>
      </div>
    </div>
    
    <SuccessModal 
      :isOpen="showSuccessModal" 
      title="Login Successful!" 
      message="You are being redirected..."
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router'; 
import { Icon } from '@iconify/vue';
import SuccessModal from '@/components/modal/SuccessModal.vue'; 

// Init Store & Router
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); 

// State Management
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const showSuccessModal = ref(false);
const currentRole = ref('tenant'); 

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const clearError = () => {
  authStore.error = null;
};

const handleLogin = async () => {
  clearError();

  // Login via Store
  const isSuccess = await authStore.login(email.value, password.value, currentRole.value);

  if (isSuccess) {
    showSuccessModal.value = true;

    setTimeout(() => {
      showSuccessModal.value = false;
      
      // --- PERBAIKAN DI SINI ---
      // Cek role user dari response authStore
      // Jika Owner -> Arahkan ke Dashboard Owner
      if (authStore.user?.role === 'owner') {
        router.push({ name: 'owner-dashboard' }); 
      } else {
        // Jika Tenant -> Arahkan ke Home
        router.push({ name: 'home' });
      }
      
    }, 1500);
  } 
};

const handleGoogleLogin = () => {
  console.log('Google login triggered');
};

onMounted(() => {
  clearError();
  email.value = '';
  password.value = '';

  // Tangkap query param ?role=owner jika ada
  if (route.query.role) {
    currentRole.value = route.query.role;
  }
});
</script>

<style scoped>
/* Reset & Variables */
* {
  box-sizing: border-box;
}

/* Layout Container */
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #ffffff;
}

/* Image Section (Left Side) */
.image-section {
  display: none;
  width: 50%;
  position: relative;
  overflow: hidden;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-section .overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 137, 123, 0.3), rgba(0, 105, 92, 0.5));
  z-index: 1;
}

@media (min-width: 1024px) {
  .image-section {
    display: block;
  }
}

/* Form Section (Right Side) */
.form-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #fafafa;
}

@media (min-width: 1024px) {
  .form-section {
    width: 50%;
  }
}

.form-wrapper {
  width: 100%;
  max-width: 500px;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.header p {
  font-size: 1rem;
  color: #666666;
  font-weight: 400;
}

/* Form Card */
.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* Input Groups */
.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.input-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  outline: none;
  font-size: 0.95rem;
  color: #333333;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.input-group input:focus {
  border-color: #00897b;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
}

.input-group input::placeholder {
  color: #bdbdbd;
  font-weight: 400;
}

/* Password Wrapper */
.password-wrapper {
  position: relative;
}

.eye-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #757575;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: #424242;
}

/* Forgot Password */
.forgot-password {
  text-align: center;
  margin-bottom: 1.75rem;
}

.forgot-password a {
  color: #00897b;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password a:hover {
  color: #00695c;
  text-decoration: underline;
}

/* Error Message */
/* --- GANTI ATAU TAMBAHKAN CSS INI DI PALING BAWAH --- */

.error-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Continue Button */
.btn-continue {
  width: 100%;
  background-color: #00897b;
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.875rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.2);
}

.btn-continue:hover {
  background-color: #00695c;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 137, 123, 0.3);
}

.btn-continue:active {
  transform: translateY(0);
}

.btn-continue:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 1.75rem 0;
}

.divider .line {
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.divider span {
  padding: 0 1rem;
  font-size: 0.8rem;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Google Button */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: #ffffff;
  border: 1.5px solid #e0e0e0;
  padding: 0.875rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  color: #424242;
  transition: all 0.2s ease;
}

.btn-google:hover {
  background-color: #fafafa;
  border-color: #bdbdbd;
}

/* Footer Text */
.footer-text {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #666666;
}

.footer-text a {
  color: #00897b;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-text a:hover {
  color: #00695c;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 2rem 1.5rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .form-section {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.75rem;
  }

  .form-card {
    padding: 1.75rem 1.25rem;
  }
}
</style>