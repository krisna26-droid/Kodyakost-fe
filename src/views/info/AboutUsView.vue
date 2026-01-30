<template>
  <div class="about-view">
    
    <section class="about-hero">
      <div class="container">
        <div class="hero-content">
          <h1>Hunian Nyaman, <br><span class="highlight">Hidup Lebih Mudah</span></h1>
          <p>KodyaKost hadir menghubungkan anak muda dengan hunian impian yang aman, strategis, dan terjangkau di Bali.</p>
        </div>
      </div>
    </section>

    <section class="story-section">
      <div class="container">
        <div class="story-grid">
          <div class="story-image">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Tim KodyaKost" 
              loading="lazy"
            />
          </div>
          <div class="story-text">
            <span class="label">Siapa Kami</span>
            <h2>Membangun Kepercayaan dalam Pencarian Kost</h2>
            <p>Berawal dari kesulitan mencari tempat tinggal yang layak dan terverifikasi di Denpasar, kami membangun KodyaKost pada tahun 2024. Misi kami sederhana: membuat proses pencarian tempat tinggal menjadi transparan, aman, dan tanpa drama.</p>
            <p>Kini kami telah membantu ribuan mahasiswa dan pekerja muda menemukan rumah kedua mereka di Pulau Dewata dengan sistem yang terintegrasi dan mudah digunakan.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="container stats-grid">
        <div class="stat-item">
          <h3>1,500+</h3>
          <p>Kamar Tersedia</p>
        </div>
        <div class="stat-item">
          <h3>5,000+</h3>
          <p>Pengguna Aktif</p>
        </div>
        <div class="stat-item">
          <h3>100+</h3>
          <p>Mitra Pemilik Kost</p>
        </div>
        <div class="stat-item">
          <h3>24/7</h3>
          <p>Layanan Support</p>
        </div>
      </div>
    </section>

    <section class="values-section">
      <div class="container">
        <div class="section-header">
          <h2>Nilai Utama Kami</h2>
          <p>Prinsip yang kami pegang teguh untuk memberikan layanan terbaik.</p>
        </div>
        
        <div class="values-grid">
          <div class="value-card">
            <div class="icon-wrapper">
              <Icon icon="mdi:shield-check" class="value-icon" />
            </div>
            <h4>Terpercaya</h4>
            <p>Setiap properti diverifikasi secara manual oleh tim lapangan kami untuk memastikan kesesuaian data.</p>
          </div>
          
          <div class="value-card">
            <div class="icon-wrapper">
              <Icon icon="mdi:flash" class="value-icon" />
            </div>
            <h4>Cepat & Mudah</h4>
            <p>Proses booking instan tanpa perlu menunggu lama konfirmasi dari pemilik kost yang sibuk.</p>
          </div>
          
          <div class="value-card">
            <div class="icon-wrapper">
              <Icon icon="mdi:heart-outline" class="value-icon" />
            </div>
            <h4>Pelayanan Peduli</h4>
            <p>Tim CS kami siap membantu menjembatani komunikasi Anda dengan pemilik kost kapan saja.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h3>Siap Menemukan Rumah Kedua Anda?</h3>
        <p>Cari kost impian Anda di Denpasar sekarang juga.</p>
        <BaseButton variant="primary" size="lg" @click="$router.push('/properties')">
          Mulai Cari Kost
          <template #icon-right><Icon icon="mdi:arrow-right" /></template>
        </BaseButton>
      </div>
    </section>

  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>

<style scoped>
/* --- GLOBAL --- */
.about-view {
  font-family: 'Poppins', sans-serif;
  color: var(--color-text); /* Gunakan Token */
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- HERO SECTION --- */
.about-hero {
  background: linear-gradient(135deg, #f0fbfb 0%, #e6f7ff 100%);
  padding: clamp(80px, 15vh, 120px) 0 80px; /* Fluid Padding */
  text-align: center;
  position: relative;
  overflow: hidden;
}

.about-hero h1 {
  font-size: var(--font-xl); /* Gunakan Token */
  font-weight: 800;
  color: #1f3a52;
  line-height: 1.2;
  margin-bottom: 20px;
}

.highlight {
  color: #fca311; /* Kuning Ciri Khas Kodya */
  position: relative;
  display: inline-block;
}

.about-hero p {
  max-width: 600px;
  margin: 0 auto;
  color: #6b7280;
  font-size: var(--font-base);
  line-height: 1.6;
}

/* --- STORY SECTION --- */
.story-section {
  padding: 100px 0;
  background: white;
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.story-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(31, 58, 82, 0.1);
  transition: transform 0.3s ease;
}

.story-text h2 {
  font-size: var(--font-lg);
  color: #1f3a52;
  margin-bottom: 25px;
  font-weight: 700;
}

/* --- STATS SECTION --- */
.stats-section {
  background: #1f3a52;
  color: white;
  padding: 70px 0;
}

.stats-grid {
  display: flex;
  justify-content: space-between;
  text-align: center;
}

.stat-item h3 {
  font-size: var(--font-xl);
  font-weight: 700;
  color: #fca311;
  margin-bottom: 5px;
}

/* --- VALUES SECTION --- */
.values-section {
  padding: 100px 0;
  background-color: #fafbfc;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.value-card {
  background: white;
  padding: 40px 30px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  text-align: center;
}

.value-card:hover {
  transform: translateY(-10px);
  border-color: #fca311;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  background: #fff8e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
}

.value-icon {
  font-size: 2.5rem;
  color: #fca311;
}

/* --- CTA SECTION --- */
.cta-section {
  padding: 80px 0;
  background: #f8fafc;
  text-align: center;
}

.cta-section h3 {
  font-size: var(--font-lg);
  margin-bottom: 15px;
  font-weight: 700;
}
.cta-section p {
  color: #6b7280;
  margin-bottom: 30px;
  font-size: var(--font-base);
}

/* --- RESPONSIVE --- */
@media (max-width: 992px) {
  .story-grid { grid-template-columns: 1fr; gap: 40px; }
  .values-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  .values-grid { grid-template-columns: 1fr; }
}
</style>