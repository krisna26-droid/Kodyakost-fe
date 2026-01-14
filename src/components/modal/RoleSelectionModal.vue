<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'select']);

const selectRole = (role) => {
  emit('select', role);
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content animate-pop">
      
      <button class="close-btn" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <h2 class="title">Sign In to KodyaKost</h2>

      <div class="cards-container">
        
        <div class="role-card" @click="selectRole('tenant')">
          <div class="icon-bg blue-light">
            <img src="@/assets/images/tenant-icon.png" alt="Tenant Icon" class="role-icon" width="70" />
          </div>
          <span class="role-text">Tenant</span>
        </div>

        <div class="role-card" @click="selectRole('owner')">
          <div class="icon-bg navy-light">
             <img src="@/assets/images/owner-icon.png" alt="Owner Icon" class="role-icon" width="70" />
          </div>
          <span class="role-text">Owner</span>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.close-btn {
  position: absolute; top: 1.5rem; right: 1.5rem;
  background: none; border: none; cursor: pointer; color: #333;
}

.title {
  font-size: 1.25rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 2rem;
  color: #000;
  letter-spacing: 0.05em;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-card {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.role-card:hover {
  border-color: #00897b;
  background-color: #f0fdfa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.1);
}

.icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  
}

.blue-light { background-color: #dbeafe; } /* Biru muda */
.navy-light { background-color: #e0e7ff; } /* Ungu muda/Navy */
.text-blue-600 { color: #2563eb; }
.text-navy-800 { color: #1e40af; }

.role-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
}

/* Animation */
.animate-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>