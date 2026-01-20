<template>
  <Transition name="pop">
    <div 
      v-if="show" 
      class="modal-backdrop"
      @click="$emit('close')"
    >
      <div class="modal-card" @click.stop>
        
        <div class="modal-header" :class="headerClass">
          <div class="header-pattern"></div>
          
          <div class="header-icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <button class="btn-close-header" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="floating-date">
             {{ formatDate(event.event_date) }}
          </div>

          <div class="content-text">
            <span class="status-badge" :class="badgeClass">
              {{ event.severity === 'high' ? 'Macet Total' : event.severity }}
            </span>

            <h3 class="event-title">
              {{ event.event_name }}
            </h3>

            <p class="event-desc">
              {{ event.description }}
            </p>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="$emit('close')">
              Tutup Info
            </button>
            
            <a 
              :href="`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`"
              target="_blank"
              class="btn-maps"
            >
              Lihat Lokasi
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-left:6px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  event: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

// 1. Logic Kelas CSS untuk Header (Standard CSS Class)
const headerClass = computed(() => {
    switch(props.event?.severity) {
        case 'high': return 'header-red';
        case 'medium': return 'header-yellow';
        default: return 'header-blue';
    }
});

// 2. Logic Kelas CSS untuk Badge
const badgeClass = computed(() => {
    switch(props.event?.severity) {
        case 'high': return 'badge-red';
        case 'medium': return 'badge-yellow';
        default: return 'badge-blue';
    }
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date(dateString));
};
</script>

<style scoped>
/* =========================================
   CSS MURNI (Tanpa Tailwind)
   ========================================= */

/* 1. Backdrop (Layar Hitam Transparan) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Hitam transparan */
  backdrop-filter: blur(4px); /* Efek blur kaca */
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* 2. Kartu Modal */
.modal-card {
  background-color: #ffffff;
  width: 100%;
  max-width: 400px; /* Lebar maksimal */
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

/* 3. Header Section */
.modal-header {
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Warna-warni Header */
.header-red { background: linear-gradient(to right, #ef4444, #dc2626); }
.header-yellow { background: linear-gradient(to right, #eab308, #ca8a04); }
.header-blue { background: linear-gradient(to right, #2563eb, #1d4ed8); }

.header-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
  opacity: 0.2;
}

.header-icon-circle {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 10px;
  position: relative;
  z-index: 2;
  color: white;
  backdrop-filter: blur(5px);
}

.btn-close-header {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.1);
  border: none;
  color: rgba(255,255,255,0.8);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-close-header:hover {
  background: rgba(0,0,0,0.3);
  color: white;
}

/* 4. Body Section */
.modal-body {
  padding: 24px;
  padding-top: 40px; /* Ruang untuk tanggal melayang */
  position: relative;
  text-align: center;
}

.floating-date {
  position: absolute;
  top: -15px; /* Naik ke atas perbatasan header */
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 6px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #f3f4f6;
}

.content-text {
  margin-bottom: 24px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  border-radius: 4px;
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.badge-red { background-color: #fef2f2; color: #dc2626; }
.badge-yellow { background-color: #fefce8; color: #854d0e; }
.badge-blue { background-color: #eff6ff; color: #2563eb; }

.event-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.event-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* 5. Tombol Aksi */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background-color: #e5e7eb; }

.btn-maps {
  background-color: #2563eb;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  transition: background 0.2s;
}
.btn-maps:hover { background-color: #1d4ed8; }

/* 6. Animasi Muncul (Pop) */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>