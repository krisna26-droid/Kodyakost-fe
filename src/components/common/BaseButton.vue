<script setup>
defineProps({
  type: { type: String, default: 'button' },
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
    default: 'md', // Default diubah ke md agar seragam dengan input
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
.base-btn {
  --c-primary-start: #00897b;   --c-primary-end: #00695c;
  --c-secondary-start: #546e7a; --c-secondary-end: #37474f;
  --c-danger-start: #e53935;    --c-danger-end: #c62828;
  --c-success-start: #43a047;   --c-success-end: #2e7d32;
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  box-sizing: border-box;
  background: var(--btn-bg, transparent);
  color: var(--btn-color, #fff);
  border: var(--btn-border, 1px solid transparent);
  box-shadow: var(--btn-shadow, none);
  font-family: inherit;
  font-weight: 700; /* Dibuat lebih bold agar modern */
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.content { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; }

/* --- SIZE SYNC WITH BASE.CSS --- */
.btn-sm { height: 2.25rem; padding: 0 1rem; font-size: var(--font-xs); }
.btn-md { height: 2.85rem; padding: 0 1.5rem; font-size: var(--font-sm); }
.btn-lg { height: 3.5rem; padding: 0 2rem; font-size: var(--font-base); }

/* --- ROUNDED SYNC --- */
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: 9999px; }

/* Variants Logic */
.btn-primary {
  --btn-bg: linear-gradient(135deg, var(--c-primary-start) 0%, var(--c-primary-end) 100%);
  --btn-shadow: 0 4px 12px rgba(0, 137, 123, 0.2);
}
.btn-outline {
  --btn-color: var(--c-primary-start);
  --btn-border: 1.5px solid var(--c-primary-start);
}
.btn-google {
  --btn-bg: #ffffff;
  --btn-color: #3c4043;
  --btn-border: 1px solid #dadce0;
}

.base-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.base-btn:active:not(:disabled) { transform: translateY(0); }
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(0.5); }

.spinner {
  width: 1.2em; height: 1.2em;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.w-full { width: 100%; }
</style>