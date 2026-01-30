<script setup>
import { useSlots, ref } from 'vue';

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

const handleInput = (event) => emit('update:modelValue', event.target.value);
const handleFocus = (event) => { isFocused.value = true; emit('focus', event); };
const handleBlur = (event) => { isFocused.value = false; emit('blur', event); };
</script>

<template>
  <div class="input-group">
    <label v-if="label" class="input-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 'has-error': error, 'is-focused': isFocused, 'is-disabled': disabled }">
      <div v-if="slots.prepend" class="icon-left"><slot name="prepend"></slot></div>

      <input 
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="disabled"
        class="form-input"
        :class="{ 'has-prepend': slots.prepend, 'has-append': slots.append }"
      />
      
      <div v-if="slots.append" class="icon-right"><slot name="append"></slot></div>
    </div>

    <div v-if="error || hint" class="input-message">
      <span v-if="error" class="error-text">{{ error }}</span>
      <span v-else-if="hint" class="hint-text">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
.input-group { width: 100%; margin-bottom: 1.5rem; }

.input-label {
  display: block;
  font-size: var(--font-sm);
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.6rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--color-background-soft);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1.1rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-base); /* Menghindari zoom otomatis di Mobile */
  color: var(--color-text);
  font-family: inherit;
}

/* Sinkronisasi Fokus */
.input-wrapper.is-focused {
  border-color: #00897b;
  background-color: var(--color-background);
  box-shadow: 0 0 0 4px rgba(0, 137, 123, 0.1);
}

.input-wrapper.has-error { border-color: #ef4444; background-color: #fff8f8; }

/* Handling Icons */
.icon-left { left: 1rem; position: absolute; display: flex; color: #94a3b8; }
.icon-right { right: 1rem; position: absolute; display: flex; color: #94a3b8; }
.form-input.has-prepend { padding-left: 2.8rem; }
.form-input.has-append { padding-right: 2.8rem; }

.error-text { font-size: var(--font-xs); color: #ef4444; font-weight: 600; margin-top: 0.4rem; display: block; }
.hint-text { font-size: var(--font-xs); color: #64748b; margin-top: 0.4rem; display: block; }

/* Responsivitas mikro untuk HP */
@media (max-width: 640px) {
  .form-input { padding: 1rem 0.9rem; }
  .input-group { margin-bottom: 1.25rem; }
}
</style>