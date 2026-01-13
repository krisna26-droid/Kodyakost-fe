<template>
  <div class="signup-container">
    
    <div class="image-section">
      <div class="overlay"></div>
      <img 
        src="@/assets/images/room.jpg" 
        alt="Bedroom Interior" 
      />
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        
        <div class="header">
          <h1>Sign Up</h1>
          <p>Register your identity to continue</p>
        </div>

        <div class="form-card">
          
          <div class="role-switcher">
            <button 
              type="button"
              class="role-btn" 
              :class="{ active: role === 'tenant' }"
              @click="role = 'tenant'"
            >
              Pencari Kost
            </button>
            <button 
              type="button"
              class="role-btn" 
              :class="{ active: role === 'owner' }"
              @click="role = 'owner'"
            >
              Pemilik Kost
            </button>
          </div>

          <form @submit.prevent="handleSignUp">
            
            <div class="input-group">
              <label>Full Name <span class="required">*</span></label>
              <input 
                v-model="fullName"
                type="text" 
                placeholder="Enter your full name here"
                required
                :disabled="authStore.loading"
              />
            </div>

            <div class="input-group">
              <label>Phone Number <span class="required">*</span></label>
              <input 
                v-model="phoneNumber"
                type="tel" 
                placeholder="Enter your phone number here"
                required
                :disabled="authStore.loading"
              />
            </div>

            <div class="input-group">
              <label>Email <span class="required">*</span></label>
              <input 
                v-model="email"
                type="email" 
                placeholder="Enter Your Email Here"
                required
                autocomplete="email"
                :disabled="authStore.loading"
              />
            </div>

            <div class="input-group">
              <label>Password <span class="required">*</span></label>
              <div class="password-wrapper">
                <input 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Enter Your Password Here"
                  required
                  autocomplete="new-password"
                  :disabled="authStore.loading"
                />
                <button type="button" class="eye-btn" @click="togglePassword">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.8 0 1.6-.1 2.38-.31"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div class="input-group">
              <label>Confirm Password <span class="required">*</span></label>
              <div class="password-wrapper">
                <input 
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  placeholder="Re-enter your password here"
                  required
                  autocomplete="new-password"
                  :disabled="authStore.loading"
                />
                <button type="button" class="eye-btn" @click="toggleConfirmPassword">
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.8 0 1.6-.1 2.38-.31"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  v-model="agreeToTerms"
                  type="checkbox" 
                  required
                  :disabled="authStore.loading"
                />
                <span class="checkbox-text">
                  By clicking, I agree to all applicable 
                  <a href="#" class="terms-link">terms and conditions</a>.
                </span>
              </label>
            </div>

            <div v-if="localError || authStore.error" class="error-message" style="color: #ef4444; background-color: #fef2f2; border: 1px solid #fee2e2; padding: 0.75rem; border-radius: 8px; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem;">
              {{ localError || authStore.error }}
            </div>

            <button 
              type="submit" 
              class="btn-continue" 
              :disabled="!agreeToTerms || authStore.loading"
              :class="{ 'opacity-70 cursor-not-allowed': authStore.loading || !agreeToTerms }"
            >
              <span v-if="authStore.loading">Creating Account...</span>
              <span v-else>Continue</span>
            </button>
          </form>

          <div class="divider">
            <div class="line"></div>
            <span>Or continue with</span>
            <div class="line"></div>
          </div>

          <button class="btn-google" @click="handleGoogleSignUp">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div class="footer-text">
            Already have an account? <router-link to="/login">Sign in here</router-link>
          </div>

        </div>
      </div>
    </div>

    <SuccessModal 
      :is-open="showSuccessModal"
      title="Account Created!"
      message="You have successfully registered. Please sign in."
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import SuccessModal from '@/components/modal/SuccessModal.vue';

const authStore = useAuthStore();
const router = useRouter();

// State Management
const role = ref('tenant'); // Default: Pencari Kost
const fullName = ref('');
const phoneNumber = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeToTerms = ref(false);

const showSuccessModal = ref(false);
const localError = ref(null);

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleSignUp = async () => {
  localError.value = null;

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match!';
    return;
  }
  
  // Kirim data ke store termasuk ROLE
  const isSuccess = await authStore.register(fullName.value, email.value, password.value, role.value);

  if (isSuccess) {
    showSuccessModal.value = true;
    setTimeout(() => {
      showSuccessModal.value = false;
      router.push('/login');
    }, 1500);
  }
};

const handleGoogleSignUp = () => {
  console.log('Google sign up triggered');
};

onMounted(() => {
  fullName.value = '';
  phoneNumber.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  agreeToTerms.value = false;
  role.value = 'tenant';
});
</script>

<style scoped>
/* Reset & Variables */
* {
  box-sizing: border-box;
}

/* Layout Container */
.signup-container {
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
  max-height: 90vh;
  overflow-y: auto;
}

/* Custom Scrollbar */
.form-card::-webkit-scrollbar {
  width: 6px;
}

.form-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.form-card::-webkit-scrollbar-thumb {
  background: #00897b;
  border-radius: 10px;
}

/* Input Groups */
.input-group {
  margin-bottom: 1.25rem;
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

.password-wrapper input {
  padding-right: 2.5rem;
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

/* Checkbox Group */
.checkbox-group {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #00897b;
  flex-shrink: 0;
}

.checkbox-text {
  font-size: 0.875rem;
  color: #333333;
  line-height: 1.5;
}

.terms-link {
  color: #00897b;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
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

.btn-continue:hover:not(:disabled) {
  background-color: #00695c;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 137, 123, 0.3);
}

.btn-continue:active:not(:disabled) {
  transform: translateY(0);
}

.btn-continue:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
  box-shadow: none;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
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
  margin-top: 1.5rem;
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
    max-height: none;
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

  .input-group {
    margin-bottom: 1rem;
  }
}
.role-switcher {
  display: flex;
  background-color: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.role-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-btn.active {
  background-color: #ffffff;
  color: #00897b;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.role-btn:hover:not(.active) {
  color: #374151;
}
</style>