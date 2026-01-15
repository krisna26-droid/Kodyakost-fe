<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'google'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  rounded: {
    type: String,
    default: 'full',
    validator: (v) => ['sm', 'md', 'lg', 'full'].includes(v)
  },
  loading: Boolean,
  disabled: Boolean,
  block: Boolean,
  icon: Boolean
});

defineEmits(['click']);
</script>

<template>
  <button 
    :type="type" 
    class="base-btn"
    :class="[
      `btn-${variant}`, 
      `btn-${size}`,
      `rounded-${rounded}`,
      { 
        'w-full': block, 
        'is-loading': loading,
        'btn-icon': icon 
      }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    
    <span v-else class="content">
      <slot name="icon-left"></slot>
      <span class="label"><slot></slot></span>
      <slot name="icon-right"></slot>
    </span>

    <div class="effects-layer"></div>
  </button>
</template>

<style scoped>
/* =========================================
   1. THEME VARIABLES
   ========================================= */
.base-btn {
  /* Colors Palette */
  --c-primary-start: #00897b;   --c-primary-end: #00695c;
  --c-secondary-start: #546e7a; --c-secondary-end: #37474f;
  --c-danger-start: #e53935;    --c-danger-end: #c62828;
  --c-success-start: #43a047;   --c-success-end: #2e7d32;
  
  /* Defaults */
  --btn-bg: transparent;
  --btn-color: #fff;
  --btn-border: 1px solid transparent;
  --btn-shadow: none;
  --btn-shadow-hover: none;
}

/* =========================================
   2. BASE STYLES
   ========================================= */
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  /* Layout Fixes */
  text-decoration: none;
  box-sizing: border-box; /* Pastikan padding tidak menambah lebar/tinggi */
  
  /* Appearance */
  background: var(--btn-bg);
  color: var(--btn-color);
  border: var(--btn-border);
  box-shadow: var(--btn-shadow);
  
  /* Typography */
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  
  /* Interactive */
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

/* Wrapper Content */
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  line-height: 1; /* Reset line-height di dalam content */
}

/* Label text fix */
.label {
  display: inline-block;
  margin-top: 1px; /* Tweak mikro: kadang font butuh didorong 1px ke bawah */
}

/* Hover Effects */
.base-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--btn-shadow-hover);
  filter: brightness(1.1);
}

.base-btn:active:not(:disabled) {
  transform: translateY(0);
  filter: brightness(0.95);
}

.base-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(0.4);
}

.base-btn:focus-visible {
  outline: 2px solid var(--c-primary-start);
  outline-offset: 2px;
}

.w-full { width: 100%; }

/* =========================================
   3. VARIANTS
   ========================================= */

.btn-primary {
  --btn-bg: linear-gradient(135deg, var(--c-primary-start) 0%, var(--c-primary-end) 100%);
  --btn-color: #ffffff;
  --btn-shadow: 0 4px 12px rgba(0, 137, 123, 0.25);
  --btn-shadow-hover: 0 8px 20px rgba(0, 137, 123, 0.35);
}

.btn-secondary {
  --btn-bg: linear-gradient(135deg, var(--c-secondary-start) 0%, var(--c-secondary-end) 100%);
  --btn-color: #ffffff;
  --btn-shadow: 0 4px 12px rgba(84, 110, 122, 0.25);
  --btn-shadow-hover: 0 8px 20px rgba(84, 110, 122, 0.35);
}

.btn-danger {
  --btn-bg: linear-gradient(135deg, var(--c-danger-start) 0%, var(--c-danger-end) 100%);
  --btn-color: #ffffff;
  --btn-shadow: 0 4px 12px rgba(229, 57, 53, 0.25);
  --btn-shadow-hover: 0 8px 20px rgba(229, 57, 53, 0.35);
}

.btn-success {
  --btn-bg: linear-gradient(135deg, var(--c-success-start) 0%, var(--c-success-end) 100%);
  --btn-color: #ffffff;
  --btn-shadow: 0 4px 12px rgba(67, 160, 71, 0.25);
  --btn-shadow-hover: 0 8px 20px rgba(67, 160, 71, 0.35);
}

.btn-outline {
  --btn-color: var(--c-primary-start);
  --btn-border: 1px solid var(--c-primary-start);
}
.btn-outline:hover:not(:disabled) {
  background-color: rgba(0, 137, 123, 0.08);
}

.btn-ghost {
  --btn-color: var(--c-primary-start);
}
.btn-ghost:hover:not(:disabled) {
  background-color: rgba(0, 137, 123, 0.1);
}

.btn-google {
  --btn-bg: #ffffff;
  --btn-color: #3c4043;
  --btn-border: 1px solid #dadce0;
  --btn-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  --btn-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-google:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #c6c9cc;
}

/* =========================================
   4. SIZES & SHAPES (SOLUSI FIX)
   ========================================= */

.rounded-sm   { border-radius: 0.25rem; }
.rounded-md   { border-radius: 0.375rem; }
.rounded-lg   { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }

/* KUNCI PERBAIKAN:
   Gunakan Height Fix dan Padding Kiri-Kanan saja.
   Padding Atas-Bawah = 0.
*/

.btn-sm { 
  height: 2rem;           /* 32px */
  padding: 0 0.875rem; 
  font-size: 0.8rem; 
}

.btn-md { 
  height: 2.5rem;         /* 40px - Ukuran Standard & Rapi */
  padding: 0 1.25rem; 
  font-size: 0.9rem;
}

.btn-lg { 
  height: 3rem;           /* 48px */
  padding: 0 1.75rem; 
  font-size: 1rem; 
}

/* Icon Mode */
.btn-icon { padding: 0; }
.btn-icon.btn-sm { width: 2rem; height: 2rem; }
.btn-icon.btn-md { width: 2.5rem; height: 2.5rem; }
.btn-icon.btn-lg { width: 3rem; height: 3rem; }

/* =========================================
   5. ANIMATIONS
   ========================================= */

.spinner {
  width: 1.15em;
  height: 1.15em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.is-loading .effects-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (prefers-color-scheme: dark) {
  .btn-google {
    --btn-bg: #202124;
    --btn-color: #e8eaed;
    --btn-border: 1px solid #5f6368;
  }
  .btn-google:hover:not(:disabled) {
    background-color: #292a2d;
    border-color: #8ab4f8;
  }
}
</style>