<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: v =>
      ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'google'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  rounded: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg', 'full'].includes(v)
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
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-container">
      <span class="spinner" />
    </span>

    <span class="content" :class="{ 'opacity-0': loading }">
      <slot name="icon-left" />
      <span class="label">
        <slot />
      </span>
      <slot name="icon-right" />
    </span>
  </button>
</template>

<style scoped>
/* =====================
   BASE & VARIABLES
===================== */
.base-btn {
  --c-primary: #00897b;
  --c-primary-dark: #00695c;
  --c-secondary: #546e7a;
  --c-danger: #e53935;
  --c-success: #43a047;
  --c-warning: #fca311; /* Tambahan Warna KodyaKost */

  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: none;

  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  overflow: hidden;

  background: var(--btn-bg, transparent);
  color: var(--btn-color, #fff);
  border: var(--btn-border, 1px solid transparent);
  box-shadow: var(--btn-shadow, none);

  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  transition: opacity 0.2s;
}

.opacity-0 {
  opacity: 0;
}

/* =====================
   SIZE
===================== */
.btn-sm { height: 2.25rem; padding: 0 1rem; font-size: 0.8125rem; }
.btn-md { height: 2.85rem; padding: 0 1.75rem; font-size: 0.9375rem; }
.btn-lg { height: 3.5rem; padding: 0 2.25rem; font-size: 1rem; }

/* =====================
   RADIUS
===================== */
.rounded-sm { border-radius: 4px; }
.rounded-md { border-radius: 12px; } 
.rounded-lg { border-radius: 16px; }
.rounded-full { border-radius: 9999px; }

/* =====================
   VARIANTS
===================== */
.btn-primary {
  --btn-bg: linear-gradient(135deg, var(--c-primary), var(--c-primary-dark));
  --btn-shadow: 0 4px 12px rgba(0, 137, 123, 0.2);
}

.btn-secondary { --btn-bg: var(--c-secondary); }
.btn-success { --btn-bg: var(--c-success); }
.btn-danger { --btn-bg: var(--c-danger); }

/* Tambahan Variant Warning untuk tombol Edit */
.btn-warning {
  --btn-bg: var(--c-warning);
  --btn-color: #fff;
  --btn-shadow: 0 4px 12px rgba(252, 163, 17, 0.2);
}

.btn-outline {
  --btn-bg: transparent;
  --btn-color: var(--c-primary);
  --btn-border: 2px solid var(--c-primary);
}

.btn-ghost {
  --btn-bg: transparent;
  --btn-color: var(--c-primary);
}

.btn-google {
  --btn-bg: #ffffff;
  --btn-color: #3c4043;
  --btn-border: 1px solid #dadce0;
}

/* =====================
   INTERACTION
===================== */
.base-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.base-btn:active:not(:disabled) {
  transform: translateY(0);
}

.base-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

/* =====================
   SPINNER LOGIC
===================== */
.spinner-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 1.4rem;
  height: 1.4rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.btn-outline .spinner, .btn-ghost .spinner, .btn-google .spinner {
  border-top-color: var(--c-primary);
  border-color: rgba(0, 137, 123, 0.1);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* =====================
   UTIL
===================== */
.w-full { width: 100%; }
.btn-icon { padding: 0; width: 2.85rem; } 
</style>