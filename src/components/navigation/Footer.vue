<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

// Data Link disesuaikan dengan route yang ada di router/index.js
const quickLinks = ref([
  { name: 'About Us', url: '/about' },       // Route: /about
  { name: 'Properties', url: '/properties' }, // Route: /properties
  { name: 'How It Works', url: '/help' },    // Arahkan ke Help dulu
  { name: 'FAQs', url: '/help' },            // Arahkan ke Help
  { name: 'Blog', url: '#' },                // Belum ada route
]);

const supportLinks = ref([
  { name: 'Contact Us', url: '#' },          // Belum ada route
  { name: 'Terms of Service', url: '/terms' },// Route: /terms
  { name: 'Privacy Policy', url: '#' },
  { name: 'Cookie Policy', url: '#' },
  { name: 'Help Center', url: '/help' },     // Route: /help
]);
</script>

<template>
  <footer class="footer-section">
    <div class="container">
      <div class="footer-content">
        
        <div class="footer-col brand-col">
          <div class="logo-wrapper">
             <img src="@/assets/images/kodyakost-logo.png" alt="KodyaKost" class="logo-img" />
          </div>
          <p class="description">
            Your trusted partner for finding the perfect boarding house in Bali.
            Nyaman, Aman, dan Terjangkau.
          </p>
          <div class="social-links">
            <a href="#" class="social-icon" aria-label="Facebook" target="_blank">
              <Icon icon="mdi:facebook" />
            </a>
            <a href="#" class="social-icon" aria-label="Instagram" target="_blank">
              <Icon icon="mdi:instagram" />
            </a>
            <a href="#" class="social-icon" aria-label="X (Twitter)" target="_blank">
              <Icon icon="ri:twitter-x-fill" />
            </a>
          </div>
        </div>

        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li v-for="link in quickLinks" :key="link.name">
              <a v-if="link.url.startsWith('#')" :href="link.url">{{ link.name }}</a>
              <router-link v-else :to="link.url">{{ link.name }}</router-link>
            </li>
          </ul>
        </div>

        <div class="footer-col">
          <h3>Support</h3>
          <ul>
            <li v-for="link in supportLinks" :key="link.name">
              <a v-if="link.url.startsWith('#')" :href="link.url">{{ link.name }}</a>
              <router-link v-else :to="link.url">{{ link.name }}</router-link>
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
              <span>Jl. Tukad Batanghari No. 15, Panjer, Denpasar, Bali 80221</span>
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
/* Scoped Style tetap sama, saya hanya merapikan sedikit variabel root local */
.footer-section {
  background-color: #1f3a52;
  color: #fff;
  padding: 60px 20px 30px;
  font-family: 'Poppins', sans-serif;
  margin-top: auto; /* Agar footer selalu di bawah jika konten sedikit */
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
  margin-bottom: 15px;
}

.logo-img {
  height: 50px; /* Disesuaikan agar tidak terlalu besar */
  object-fit: contain;
  filter: brightness(0) invert(1); /* Trik CSS agar logo jadi putih jika aslinya berwarna */
}

.description {
  color: #d1d5db;
  margin-bottom: 20px;
  line-height: 1.6;
  max-width: 300px;
  font-size: 0.95rem;
}

h3 {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  color: #fca311; /* Acent color pada judul */
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  margin-bottom: 12px;
}

/* Style untuk Router Link dan A tag */
ul li a {
  color: #d1d5db;
  text-decoration: none;
  transition: 0.3s;
  display: inline-block;
}

ul li a:hover {
  color: #fca311;
  transform: translateX(5px);
}

/* Contact Specific */
.contact-col ul li {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  color: #d1d5db;
  margin-bottom: 15px;
}

.contact-col .icon {
  color: #fca311;
  font-size: 1.4rem;
  margin-top: 2px;
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
  font-size: 1.2rem;
}

.social-icon:hover {
  background-color: #fca311;
  color: #1f3a52;
  transform: translateY(-3px);
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
    gap: 30px;
  }
}
</style>