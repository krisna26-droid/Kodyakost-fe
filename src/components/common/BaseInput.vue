<script setup>
import { useSlots, ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: null },
  hint: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

const slots = useSlots();
const isFocused = ref(false);

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};
</script>

<template>
  <div class="input-group">
    <!-- Label -->
    <label v-if="label" class="input-label">
      {{ label }} 
      <span v-if="required" class="required">*</span>
    </label>
    
    <!-- Input Wrapper -->
    <div 
      class="input-wrapper"
      :class="{ 
        'has-error': error,
        'is-focused': isFocused,
        'is-disabled': disabled
      }"
    >
      <!-- Icon Kiri -->
      <div v-if="slots.prepend" class="icon-left">
        <slot name="prepend"></slot>
      </div>

      <!-- Input -->
      <input 
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        class="form-input"
        :class="{ 
          'has-prepend': slots.prepend,
          'has-append': slots.append
        }"
      />
      
      <!-- Icon Kanan -->
      <div v-if="slots.append" class="icon-right">
        <slot name="append"></slot>
      </div>
    </div>

    <!-- Error/Hint Message -->
    <div v-if="error || hint" class="input-message">
      <span v-if="error" class="error-text">{{ error }}</span>
      <span v-else-if="hint" class="hint-text">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Input Group Container */
.input-group {
  width: 100%;
  margin-bottom: 1.25rem;
}

/* Label */
.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.required { 
  color: #ef4444; 
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.625rem;
  transition: all 0.2s ease;
}

.input-wrapper:hover:not(.is-disabled) {
  border-color: #d1d5db;
  background-color: #ffffff;
}

.input-wrapper.is-focused {
  border-color: #00897b;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
}

.input-wrapper.has-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.input-wrapper.has-error.is-focused {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-wrapper.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

/* Input Element */
.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1a1a1a;
  font-family: inherit;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:disabled {
  cursor: not-allowed;
  color: #6b7280;
}

/* Padding dengan icon */
.form-input.has-prepend {
  padding-left: 2.75rem;
}

.form-input.has-append {
  padding-right: 2.75rem;
}

/* Icon Positioning */
.icon-left,
.icon-right {
  position: absolute;
  display: flex;
  align-items: center;
  color: #6b7280;
  pointer-events: none;
  transition: color 0.2s ease;
}

.icon-left {
  left: 1rem;
}

.icon-right {
  right: 1rem;
}

.is-focused .icon-left,
.is-focused .icon-right {
  color: #00897b;
}

.has-error .icon-left,
.has-error .icon-right {
  color: #ef4444;
}

/* Messages */
.input-message {
  margin-top: 0.375rem;
  min-height: 1.25rem;
}

.error-text {
  display: block;
  font-size: 0.8125rem;
  color: #ef4444;
  font-weight: 500;
}

.hint-text {
  display: block;
  font-size: 0.8125rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 640px) {
  .form-input {
    font-size: 0.9375rem;
    padding: 0.75rem 0.875rem;
  }

  .form-input.has-prepend {
    padding-left: 2.5rem;
  }

  .form-input.has-append {
    padding-right: 2.5rem;
  }

  .icon-left {
    left: 0.875rem;
  }

  .icon-right {
    right: 0.875rem;
  }
}
</style>