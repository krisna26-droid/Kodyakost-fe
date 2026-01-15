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

  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>

<style scoped>
/* --- GLOBAL --- */
.about-view {
  font-family: 'Poppins', sans-serif;
  color: #333;
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
  padding: 100px 0 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.about-hero::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(252, 163, 17, 0.1);
  border-radius: 50%;
  filter: blur(50px);
}

.about-hero h1 {
  font-size: 2.8rem;
  font-weight: 800;
  color: #1f3a52;
  line-height: 1.2;
  margin-bottom: 20px;
  position: relative;
}

.highlight {
  color: #fca311;
  position: relative;
  display: inline-block;
}

.about-hero p {
  max-width: 600px;
  margin: 0 auto;
  color: #6b7280;
  font-size: 1.15rem;
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
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(31, 58, 82, 0.1);
  transition: transform 0.3s ease;
}

.story-image img:hover {
  transform: translateY(-5px);
}

.story-text .label {
  color: #fca311;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 10px;
}

.story-text h2 {
  font-size: 2.2rem;
  color: #1f3a52;
  margin-bottom: 25px;
  font-weight: 700;
  line-height: 1.3;
}

.story-text p {
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 20px;
  font-size: 1.05rem;
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
  font-size: 3rem;
  font-weight: 700;
  color: #fca311;
  margin-bottom: 5px;
  line-height: 1;
}

.stat-item p {
  font-size: 1.1rem;
  color: #cbd5e1;
  font-weight: 500;
}

/* --- VALUES SECTION --- */
.values-section {
  padding: 100px 0;
  background-color: #fafbfc;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.2rem;
  color: #1f3a52;
  font-weight: 700;
  margin-bottom: 10px;
}

.section-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.value-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  text-align: center;
}

.value-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
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
  transition: background 0.3s;
}

.value-card:hover .icon-wrapper {
  background: #fca311;
}

.value-icon {
  font-size: 2.5rem;
  color: #fca311;
  transition: color 0.3s;
}

.value-card:hover .value-icon {
  color: white;
}

.value-card h4 {
  font-size: 1.3rem;
  color: #1f3a52;
  margin-bottom: 15px;
  font-weight: 700;
}

.value-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* --- RESPONSIVE MEDIA QUERIES --- */
@media (max-width: 992px) {
  .story-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .story-image img {
    height: 300px;
  }
  .values-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .about-hero h1 {
    font-size: 2.2rem;
  }
  
  /* Grid untuk Stats di HP agar 2 kolom baris */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .stat-item h3 {
    font-size: 2.2rem;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }
}
</style>