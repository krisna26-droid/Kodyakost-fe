<script setup>
import { ref } from 'vue';
// 1. Import komponen Icon dari Iconify
import { Icon } from '@iconify/vue';

const quickLinks = ref([
  { name: 'About Us', url: '#' },
  { name: 'Properties', url: '#' },
  { name: 'How It Works', url: '#' },
  { name: 'FAQs', url: '#' },
  { name: 'Blog', url: '#' },
]);

const supportLinks = ref([
  { name: 'Contact Us', url: '#' },
  { name: 'Terms of Service', url: '#' },
  { name: 'Privacy Policy', url: '#' },
  { name: 'Cookie Policy', url: '#' },
  { name: 'Help Center', url: '#' },
]);
</script>

<template>
  <footer class="footer-section">
    <div class="container">
      <div class="footer-content">
        
        <div class="footer-col brand-col">
          <div class="logo-wrapper">
             <img src="@/assets/images/kodyakost-logo-putih.png" alt="KodyaKost" class="logo-img" />
          </div>
          <p class="description">
            Your trusted partner for finding the perfect boarding house in Bali
          </p>
          <div class="social-links">
            <a href="#" class="social-icon" aria-label="Facebook">
              <Icon icon="mdi:facebook" />
            </a>
            <a href="#" class="social-icon" aria-label="Instagram">
              <Icon icon="mdi:instagram" />
            </a>
            <a href="#" class="social-icon" aria-label="X (Twitter)">
              <Icon icon="ri:twitter-x-fill" />
            </a>
          </div>
        </div>

        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li v-for="link in quickLinks" :key="link.name">
              <a :href="link.url">{{ link.name }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>Support</h3>
          <ul>
            <li v-for="link in supportLinks" :key="link.name">
              <a :href="link.url">{{ link.name }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-col contact-col">
          <h3>Contact Info</h3>
          <ul>
            <li>
              <span class="icon">
                <Icon icon="mdi:map-marker" />
              </span>
              <span>Jl. Kalcer Banget Nih No. 15, Denpasar, Bali 80221</span>
            </li>
            <li>
              <span class="icon">
                <Icon icon="mdi:phone" />
              </span>
              <span>+62 821 4444 3333</span>
            </li>
            <li>
              <span class="icon">
                <Icon icon="mdi:email" />
              </span>
              <span>hello@kodyakost.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 KodyaKost. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Variabel Warna */
:root {
  --bg-color: #1f3a52; 
  --text-color: #d1d5db;
  --accent-color: #fca311;
}

.footer-section {
  background-color: #1f3a52;
  color: #fff;
  padding: 60px 20px 30px;
  font-family: 'Poppins', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-col {
  flex: 1;
  min-width: 200px;
}

.brand-col {
  flex: 1.5;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 15px; /* Sedikit spasi tambahan agar rapi */
}

.logo-img {
  height: 90px;
}

.description {
  color: #d1d5db;
  margin-bottom: 20px;
  line-height: 1.6;
  max-width: 300px;
}

h3 {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  margin-bottom: 12px;
}

ul li a {
  color: #d1d5db;
  text-decoration: none;
  transition: 0.3s;
}

ul li a:hover {
  color: #fca311;
  padding-left: 5px; /* Efek geser sedikit saat hover */
}

/* Contact Specific */
.contact-col ul li {
  display: flex;
  gap: 15px;
  align-items: flex-start; /* Icon sejajar dengan baris pertama teks */
  color: #d1d5db;
  margin-bottom: 15px;
}

.contact-col .icon {
  color: #fca311;
  font-size: 1.4rem; /* Ukuran icon contact */
  display: flex;     /* Memastikan icon centering */
  margin-top: 2px;   /* Minor adjustment agar sejajar mata dengan teks */
}

/* Social Icons */
.social-links {
  display: flex;
  gap: 10px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: 0.3s;
  font-size: 1.2rem; /* Mengatur ukuran icon di dalam lingkaran */
}

.social-icon:hover {
  background-color: #fca311;
  color: #1f3a52; /* Icon berubah warna gelap saat background terang */
  transform: translateY(-3px); /* Efek naik sedikit */
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 30px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

/* Responsive Mobile */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }
}
</style>