<template>
  <div class="page-container">
    <div class="header-wrapper">
      <div class="header-content">
        <h1 class="title">Kalender Budaya</h1>
        <p class="subtitle">Info kemacetan & upacara adat Denpasar</p>
      </div>
      <div class="header-decoration"></div>
    </div>

    <div class="content-container">
      
      <div v-if="loading" class="state-wrapper">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="loading-text">Memuat data event...</p>
      </div>

      <div v-else-if="error" class="error-wrapper">
        <p class="error-title">Terjadi Kesalahan</p>
        {{ error }}
      </div>

      <div v-else-if="events.length === 0" class="empty-wrapper">
        <div class="empty-icon-box">
          <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="empty-text">Tidak ada event dalam waktu dekat.</p>
        <p class="empty-subtext">Jalanan Denpasar terpantau aman.</p>
      </div>

      <div v-else class="event-list">
        <div 
          v-for="event in events" 
          :key="event.id"
          class="event-card fade-in-up"
        >
          <div 
            class="severity-badge"
            :class="getSeverityClass(event.severity)"
          >
            {{ event.severity === 'high' ? 'Macet Total' : event.severity }}
          </div>

          <div class="date-row">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="date-text">
              {{ formatDate(event.event_date) }}
            </p>
          </div>

          <h3 class="event-title">
            {{ event.event_name }}
          </h3>
          
          <span class="type-badge">
            {{ event.event_type ? event.event_type.replace('_', ' ') : 'Event' }}
          </span>

          <p class="event-desc">
            {{ event.description }}
          </p>

          <div class="card-footer">
             <div class="location-info">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-pin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{{ event.district || 'Denpasar Area' }}</span>
             </div>
             
             <a 
               :href="`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`" 
               target="_blank" 
               class="maps-link"
             >
               Buka Peta 
               <svg xmlns="http://www.w3.org/2000/svg" class="icon-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
               </svg>
             </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/Axios'; 

const events = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchEvents = async () => {
  try {
    loading.value = true;
    const response = await api.get('/cultural-events');
    if (response.data.success && response.data.data) {
        events.value = response.data.data;
    } else {
        events.value = response.data; 
    }
  } catch (err) {
    console.error("Error:", err);
    error.value = "Gagal memuat data. Periksa koneksi internet.";
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(date);
};

// Helper function for dynamic classes (pengganti logic di template)
const getSeverityClass = (severity) => {
  if (severity === 'high') return 'bg-red';
  if (severity === 'medium') return 'bg-yellow';
  return 'bg-blue';
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
/* --- UTAMA (Container) --- */
.page-container {
  min-height: 100vh;
  background-color: #f9fafb; /* gray-50 */
  padding-bottom: 5rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

/* --- HEADER SECTION --- */
.header-wrapper {
  background-color: #1e3a8a; /* blue-900 */
  color: white;
  padding: 1.5rem;
  border-bottom-left-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 10;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  color: #bfdbfe; /* blue-200 */
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.header-decoration {
  position: absolute;
  right: -2.5rem;
  top: -2.5rem;
  width: 8rem;
  height: 8rem;
  background-color: #1e40af; /* blue-800 */
  border-radius: 9999px;
  opacity: 0.5;
  filter: blur(24px);
}

/* --- CONTENT SECTION --- */
.content-container {
  padding-left: 1rem;
  padding-right: 1rem;
  margin-top: 1.5rem;
}

/* Loading & States */
.state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5rem;
  padding-bottom: 5rem;
  color: #9ca3af; /* gray-400 */
}

.spinner {
  animation: spin 1s linear infinite;
  height: 2.5rem;
  width: 2.5rem;
  color: #1e3a8a; /* blue-900 */
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Error State */
.error-wrapper {
  background-color: #fef2f2; /* red-50 */
  color: #dc2626; /* red-600 */
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
  border: 1px solid #fee2e2;
}
.error-title { font-weight: 700; margin-bottom: 0.25rem; }

/* Empty State */
.empty-wrapper {
  text-align: center;
  padding-top: 3rem;
  padding-bottom: 3rem;
  color: #9ca3af;
}
.empty-icon-box {
  background-color: #f3f4f6;
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
}
.empty-icon { height: 2.5rem; width: 2.5rem; color: #d1d5db; }
.empty-text { font-weight: 500; }
.empty-subtext { font-size: 0.75rem; margin-top: 0.25rem; color: #9ca3af; }

/* --- CARD LIST --- */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  background-color: white;
  padding: 1.25rem;
  border-radius: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6; /* gray-100 */
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.event-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.event-card:active {
  transform: scale(0.99);
}

/* Badge Severity */
.severity-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.625rem; /* 10px */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom-left-radius: 0.75rem;
}
.bg-red { background-color: #ef4444; color: white; }
.bg-yellow { background-color: #facc15; color: black; }
.bg-blue { background-color: #dbeafe; color: #1e40af; }

/* Typography */
.date-row {
  display: flex;
  align-items: center;
  color: #2563eb; /* blue-600 */
  margin-bottom: 0.5rem;
}
.icon-small { height: 1rem; width: 1rem; margin-right: 0.25rem; }
.date-text { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; }

.event-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937; /* gray-800 */
  margin-bottom: 0.25rem;
  padding-right: 2rem;
  line-height: 1.375;
}

.type-badge {
  display: inline-block;
  background-color: #f3f4f6; /* gray-100 */
  color: #6b7280; /* gray-500 */
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.event-desc {
  color: #6b7280; /* gray-500 */
  font-size: 0.875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.625;
}

/* Footer & Maps */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #f3f4f6;
}

.location-info {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}
.icon-pin { height: 1rem; width: 1rem; margin-right: 0.25rem; color: #f87171; }

.maps-link {
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 700;
  display: flex;
  align-items: center;
  background-color: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
}
.maps-link:hover { text-decoration: underline; }
.icon-arrow { height: 0.75rem; width: 0.75rem; margin-left: 0.25rem; }

/* Animasi Fade In Up */
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.fade-in-up:nth-child(1) { animation-delay: 0.1s; }
.fade-in-up:nth-child(2) { animation-delay: 0.15s; }
.fade-in-up:nth-child(3) { animation-delay: 0.2s; }
.fade-in-up:nth-child(4) { animation-delay: 0.25s; }
.fade-in-up:nth-child(5) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>