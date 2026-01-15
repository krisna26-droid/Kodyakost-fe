<template>
  <div class="terms-view">
    <div class="container">
      <header class="terms-header">
        <h1>Syarat & Ketentuan</h1>
        <p class="last-updated">Terakhir diperbarui: 15 Januari 2026</p>
      </header>

      <article class="terms-content">
        <h3>1. Pendahuluan</h3>
        <p>Selamat datang di KodyaKost. Dengan mengakses situs web kami dan menggunakan layanan kami, Anda setuju untuk mematuhi dan terikat oleh syarat dan ketentuan berikut.</p>

        <h3>2. Akun Pengguna</h3>
        <p>Untuk menggunakan fitur tertentu, Anda diwajibkan mendaftar akun. Anda setuju untuk memberikan informasi yang akurat, terkini, dan lengkap selama proses pendaftaran serta menjaga keamanan kata sandi Anda.</p>

        <h3>3. Pemesanan dan Pembayaran</h3>
        <p>Saat Anda memesan properti melalui KodyaKost, Anda setuju untuk membayar biaya yang terkait dengan pemesanan Anda. Semua pembayaran diproses dengan aman. Kebijakan pembatalan ditentukan oleh masing-masing pemilik properti.</p>

        <h3>4. Larangan Penggunaan</h3>
        <p>Anda setuju untuk tidak menggunakan layanan ini untuk tujuan yang melanggar hukum atau dengan cara apa pun yang dapat mengganggu, merusak, atau merugikan layanan kami maupun pengguna lain.</p>

        <h3>5. Batasan Tanggung Jawab</h3>
        <p>KodyaKost bertindak sebagai platform perantara. Kami tidak bertanggung jawab atas kondisi properti yang terdaftar atau tindakan pemilik properti, meskipun kami berusaha memverifikasi semua daftar demi keamanan Anda.</p>
      </article>
      
      <div class="footer-note">
        <p>Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami di <a href="#">support@kodyakost.com</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terms-view {
  font-family: 'Poppins', sans-serif;
  color: #333;
  padding: 60px 0;
  background-color: #fff;
  min-height: 100vh;
}
.container { max-width: 768px; margin: 0 auto; padding: 0 25px; }

.terms-header {
  text-align: center;
  margin-bottom: 50px;
  border-bottom: 1px solid #eee;
  padding-bottom: 30px;
}
.terms-header h1 { color: #1f3a52; font-weight: 700; margin-bottom: 10px; }
.last-updated { color: #888; font-style: italic; font-size: 0.9rem; }

.terms-content h3 {
  color: #1f3a52;
  margin-top: 35px;
  margin-bottom: 15px;
  font-weight: 600;
  font-size: 1.2rem;
}
.terms-content p {
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
  text-align: justify;
}

.footer-note {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
}
.footer-note a { color: #fca311; text-decoration: none; }
</style>