<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
  message: String
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" class="checkmark">
          <circle cx="12" cy="12" r="11" fill="none" stroke="#22c55e" stroke-width="2"/>
          <path d="M7 13l3 3 7-7" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check"/>
        </svg>
      </div>
      
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.checkmark {
  width: 100%;
  height: 100%;
}

h3 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

p {
  color: #6b7280;
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Checkmark Animation */
.check {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawCheck 0.5s 0.2s forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}
</style>