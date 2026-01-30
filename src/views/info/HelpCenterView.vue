<template>
  <div class="help-center">
    <section class="help-hero">
      <div class="container text-center">
        <h1 class="hero-title">How can we help you?</h1>
        <p class="hero-subtitle">Cari jawaban seputar booking, pembayaran, dan akun.</p>
        <div class="search-box">
          <Icon icon="mdi:magnify" class="search-icon" />
          <input type="text" placeholder="Cari pertanyaan (misal: refund, pembayaran)..." />
        </div>
      </div>
    </section>

    <section class="faq-section container">
      <h2 class="section-title">Pertanyaan Sering Diajukan</h2>
      
      <div class="faq-grid">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index" 
          class="faq-item" 
          :class="{ active: faq.isOpen }"
          @click="toggleFaq(index)"
        >
          <div class="faq-question">
            <span>{{ faq.question }}</span>
            <Icon :icon="faq.isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="toggle-icon" />
          </div>
          
          <transition name="slide-down">
            <div class="faq-answer" v-show="faq.isOpen">
              <p>{{ faq.answer }}</p>
            </div>
          </transition>
        </div>
      </div>

      <div class="contact-support">
        <h3>Masih butuh bantuan?</h3>
        <p>Tim support kami siap membantu Anda 24/7.</p>
        
        <BaseButton 
          variant="primary" 
          size="lg" 
          class="contact-btn-wa"
          @click="openWhatsApp"
        >
          <template #icon-left><Icon icon="mdi:whatsapp" /></template>
          Chat via WhatsApp
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const faqs = ref([
  {
    question: "Bagaimana cara melakukan booking kost?",
    answer: "Cari kost yang Anda inginkan, klik tombol 'Ajukan Booking', pilih tanggal masuk dan durasi sewa, lalu ikuti instruksi pembayaran yang tersedia.",
    isOpen: true
  },
  {
    question: "Apakah uang bisa kembali jika saya membatalkan pesanan?",
    answer: "Kebijakan pengembalian dana bergantung pada masing-masing pemilik kost. Umumnya, pembatalan H-7 akan mendapatkan refund 50%. Cek detail di halaman kost.",
    isOpen: false
  },
  {
    question: "Apakah biaya listrik sudah termasuk?",
    answer: "Setiap kost memiliki kebijakan berbeda. Silakan cek bagian 'Fasilitas' pada halaman detail kost. Jika tertera 'Listrik', berarti sudah termasuk.",
    isOpen: false
  },
  {
    question: "Bagaimana jika saya ingin survei lokasi dulu?",
    answer: "Anda bisa menggunakan fitur 'Hubungi Pemilik' untuk membuat janji temu survei langsung sebelum melakukan pembayaran.",
    isOpen: false
  }
]);

const toggleFaq = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen;
};

const openWhatsApp = () => {
  window.open('https://wa.me/6281234567890', '_blank');
};
</script>

<style scoped>
.help-center { font-family: 'Poppins', sans-serif; min-height: 100vh; background: #f9fafb; padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 0 20px; }

/* HERO */
.help-hero {
  background-color: #1f3a52;
  padding: 80px 0 120px;
  color: white;
  text-align: center;
}
.hero-title { font-size: var(--font-xl); font-weight: 800; margin-bottom: 10px; }
.hero-subtitle { color: #cbd5e1; margin-bottom: 40px; font-size: var(--font-base); }

.search-box {
  position: relative;
  max-width: 550px;
  margin: 0 auto;
}
.search-box input {
  width: 100%;
  padding: 18px 20px 18px 55px;
  border-radius: var(--radius-full);
  border: none;
  font-size: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  outline: none;
}
.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.6rem;
}

/* FAQ */
.section-title { text-align: center; margin: 60px 0 30px; color: #1f3a52; font-weight: 800; font-size: var(--font-lg); }

.faq-item {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.faq-item.active { border-color: #fca311; box-shadow: 0 8px 16px rgba(252, 163, 17, 0.1); }

.faq-question {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #1f3a52;
}
.toggle-icon { color: #fca311; font-size: 1.6rem; }

.faq-answer {
  padding: 0 22px 22px;
  color: #64748b;
  line-height: 1.8;
  font-size: 0.95rem;
  border-top: 1px solid #f8fafc;
  padding-top: 15px;
}

/* CONTACT BOX */
.contact-support {
  text-align: center;
  margin-top: 80px;
  padding: 50px 30px;
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 25px rgba(0,0,0,0.03);
}

.contact-support h3 { font-weight: 800; color: #1f3a52; margin-bottom: 10px; }
.contact-support p { color: #64748b; margin-bottom: 30px; }

/* Override BaseButton for WhatsApp Green */
.contact-btn-wa {
  background-color: #25D366 !important;
  border-color: #25D366 !important;
  border-radius: var(--radius-full) !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
}

/* ANIMATION: Smooth Slide Down */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease-out;
  max-height: 200px;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>