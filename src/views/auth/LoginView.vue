<script setup>
import { ref } from 'vue';

// State management
const email = ref('');
const password = ref('');
const showPassword = ref(false);

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = () => {
  console.log('Logging in with:', email.value, password.value);
};

const handleGoogleLogin = () => {
  console.log('Google login triggered');
};
</script>

<template>
  <div class="login-container">
    
    <div class="image-section">
      <div class="overlay"></div>
      <img 
        src="@/assets/images/room.jpg" 
        alt="Bedroom" 
      />
    </div>

    <div class="form-section">
      <div class="form-wrapper">
        
        <div class="header">
          <h1>Sign In</h1>
          <p>Enter Your Identity to Sign In</p>
        </div>

        <div class="card">
          
          <form @submit.prevent="handleLogin">
            
            <div class="input-group">
              <label>Email <span class="required">*</span></label>
              <input 
                v-model="email"
                type="email" 
                placeholder="Enter Your Email Here"
                required
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
                />
                <button type="button" class="eye-btn" @click="togglePassword">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.8 0 1.6-.1 2.38-.31"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <div class="forgot-pass">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" class="btn-primary">
              Continue
            </button>
          </form>

          <div class="divider">
            <div class="line"></div>
            <span>Or continue with</span>
            <div class="line"></div>
          </div>

          <button class="btn-google" @click="handleGoogleLogin">
            <svg viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div class="footer-link">
            Don't have an account? <a href="#">Sign up now</a>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* VARIABLES */
:root {
  --primary-color: #00897b; /* Teal mirip gambar */
  --primary-hover: #00695c;
  --text-dark: #1f2937;
  --text-gray: #6b7280;
  --border-color: #e5e7eb;
  --bg-white: #ffffff;
}

/* LAYOUT UTAMA */
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* BAGIAN KIRI (GAMBAR) */
.image-section {
  display: none; /* Hidden di mobile */
  width: 50%;
  position: relative;
  background-color: #f3f4f6;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

.image-section .overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(31, 75, 85, 0.8), transparent);
  z-index: 1;
}

/* Tampilkan gambar hanya di layar besar */
@media (min-width: 1024px) {
  .image-section {
    display: block;
  }
}

/* BAGIAN KANAN (FORM) */
.form-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--bg-white);
}

@media (min-width: 1024px) {
  .form-section {
    width: 50%;
  }
}

.form-wrapper {
  width: 100%;
  max-width: 480px;
}

/* HEADER TEXT */
.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.25rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.header p {
  color: var(--text-gray);
  font-size: 1rem;
}

/* CARD STYLE */
.card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

/* INPUT GROUPS */
.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  outline: none;
  font-size: 1rem;
  color: #4b5563;
  transition: all 0.2s;
  box-sizing: border-box; /* Penting agar padding tidak menambah width */
}

.input-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.input-group input::placeholder {
  color: #d1d5db;
}

/* PASSWORD TOGGLE */
.password-wrapper {
  position: relative;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
  align-items: center;
}

.eye-btn:hover {
  color: #4b5563;
}

/* FORGOT PASSWORD */
.forgot-pass {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.forgot-pass a {
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.forgot-pass a:hover {
  text-decoration: underline;
}

/* PRIMARY BUTTON */
.btn-primary {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 9999px; /* Pill shape */
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

/* DIVIDER */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider .line {
  flex-grow: 1;
  height: 1px;
  background-color: var(--border-color);
}

.divider span {
  padding: 0 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #9ca3af;
}

/* GOOGLE BUTTON */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: white;
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 500;
  color: #374151;
  font-size: 1rem;
}

.btn-google:hover {
  background-color: #f9fafb;
}

.btn-google svg {
  width: 20px;
  height: 20px;
}

/* FOOTER */
.footer-link {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-gray);
}

.footer-link a {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.footer-link a:hover {
  text-decoration: underline;
}
</style>