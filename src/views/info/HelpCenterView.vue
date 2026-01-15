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
          <transition name="slide-fade">
            <div class="faq-answer" v-show="faq.isOpen">
              <p>{{ faq.answer }}</p>
            </div>
          </transition>
        </div>
      </div>

      <div class="contact-support">
        <h3>Masih butuh bantuan?</h3>
        <p>Tim support kami siap membantu Anda 24/7.</p>
        <button class="contact-btn">
          <Icon icon="mdi:whatsapp" /> Chat via WhatsApp
        </button>
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
</script>

<style scoped>
.help-center { font-family: 'Poppins', sans-serif; min-height: 100vh; background: #f9fafb; }
.container { max-width: 800px; margin: 0 auto; padding: 0 20px; }

/* HERO */
.help-hero {
  background-color: #1f3a52;
  padding: 80px 0 100px;
  color: white;
  text-align: center;
  margin-bottom: -40px; /* Overlap effect */
}
.hero-title { font-weight: 700; margin-bottom: 10px; }
.hero-subtitle { color: #cbd5e1; margin-bottom: 30px; }

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}
.search-box input {
  width: 100%;
  padding: 16px 20px 16px 50px;
  border-radius: 50px;
  border: none;
  font-size: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.5rem;
}

/* FAQ */
.section-title { text-align: center; margin: 60px 0 30px; color: #1f3a52; font-weight: 700; }

.faq-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}
.faq-item.active { border-color: #fca311; box-shadow: 0 4px 12px rgba(252, 163, 17, 0.1); }

.faq-question {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
}
.toggle-icon { color: #fca311; font-size: 1.5rem; transition: transform 0.3s; }

.faq-answer {
  padding: 0 20px 20px;
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 15px;
}

/* CONTACT */
.contact-support {
  text-align: center;
  margin: 60px 0;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.contact-btn {
  background: #25D366;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s;
}
.contact-btn:hover { transform: scale(1.05); }

/* Animation */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>