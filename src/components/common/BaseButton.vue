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
      ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'google'].includes(v)
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
    <span v-if="loading" class="spinner" />

    <span v-else class="content">
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
   BASE
===================== */
.base-btn {
  --c-primary: #00897b;
  --c-primary-dark: #00695c;
  --c-secondary: #546e7a;
  --c-danger: #e53935;
  --c-success: #43a047;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;

  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;

  background: var(--btn-bg, transparent);
  color: var(--btn-color, #fff);
  border: var(--btn-border, 1px solid transparent);
  box-shadow: var(--btn-shadow, none);

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* =====================
   SIZE
===================== */
.btn-sm {
  height: 2.25rem;
  padding: 0 1rem;
  font-size: var(--font-xs);
}

.btn-md {
  height: 2.75rem;
  padding: 0 1.5rem;
  font-size: var(--font-sm);
}

.btn-lg {
  height: 3.25rem;
  padding: 0 2rem;
  font-size: var(--font-base);
}

/* =====================
   RADIUS
===================== */
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: 9999px; }

/* =====================
   VARIANTS
===================== */
.btn-primary {
  --btn-bg: linear-gradient(135deg, var(--c-primary), var(--c-primary-dark));
  --btn-shadow: 0 6px 16px rgba(0, 137, 123, 0.25);
}

.btn-secondary {
  --btn-bg: var(--c-secondary);
}

.btn-success {
  --btn-bg: var(--c-success);
}

.btn-danger {
  --btn-bg: var(--c-danger);
}

.btn-outline {
  --btn-bg: transparent;
  --btn-color: var(--c-primary);
  --btn-border: 1.5px solid var(--c-primary);
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
}

.btn-outline:hover:not(:disabled),
.btn-ghost:hover:not(:disabled) {
  background: rgba(0, 137, 123, 0.08);
}

.base-btn:active:not(:disabled) {
  transform: translateY(0);
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =====================
   ICON MODE
===================== */
.btn-icon {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/* =====================
   SPINNER
===================== */
.spinner {
  width: 1.2em;
  height: 1.2em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =====================
   UTIL
===================== */
.w-full {
  width: 100%;
}
</style>
