<template>
  <div class="payment-success-page">
    <div class="card shadow-premium">
      
      <div class="success-animation">
        <Icon icon="mdi:check-decagram" class="check-icon" />
      </div>

      <h1 class="title">Pembayaran Berhasil!</h1>
      <p class="desc">Terima kasih, pembayaran Anda telah terverifikasi otomatis. Kamar Anda sudah siap untuk dihuni.</p>

      <div class="ticket">
        <div class="ticket-header">
          <span>Rincian Transaksi</span>
        </div>
        <div class="ticket-body">
          <div class="row">
            <span class="label">ID Transaksi</span>
            <span class="val">TRX-882910</span>
          </div>
          <div class="row">
            <span class="label">Metode</span>
            <span class="val">BCA Virtual Account</span>
          </div>
          <div class="row">
            <span class="label">Tanggal</span>
            <span class="val">24 Jan 2026, 14:30</span>
          </div>
          <div class="divider"></div>
          <div class="row total">
            <span>Total Bayar</span>
            <span class="amount">Rp 4.505.000</span>
          </div>
        </div>
        <div class="ticket-punch"></div> </div>

      <div class="actions">
        <BaseButton variant="primary" block size="md" @click="$router.push('/my-bookings')">
          <template #icon-left><Icon icon="mdi:ticket-confirmation-outline" /></template>
          Lihat Tiket & Check-in
        </BaseButton>
        
        <BaseButton variant="ghost" block size="md" @click="$router.push('/')" class="text-gray-btn">
          Kembali ke Beranda
        </BaseButton>
      </div>

    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
// BaseButton otomatis ter-import jika sudah didaftarkan global, 
// atau import manual jika perlu:
// import BaseButton from '@/components/common/BaseButton.vue';
</script>

<style scoped>
.payment-success-page { 
  display: flex; align-items: center; justify-content: center; 
  min-height: 100vh; background: #f0fdf4; padding: 20px; 
  font-family: 'Poppins', sans-serif; 
}

.card { 
  background: white; width: 100%; max-width: 440px; 
  padding: 50px 35px; border-radius: 24px; text-align: center; 
  position: relative;
}

.shadow-premium {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(16, 185, 129, 0.05);
}

.success-animation { margin-bottom: 25px; }
.check-icon { font-size: 6rem; color: #10b981; animation: popIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

.title { font-size: 1.75rem; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; }
.desc { color: #64748b; font-size: 0.95rem; margin-bottom: 35px; line-height: 1.6; padding: 0 10px; }

/* Ticket Style */
.ticket { 
  background: #f8fafc; border-radius: 16px; overflow: hidden; 
  margin-bottom: 35px; border: 1px solid #e2e8f0; text-align: left; 
  position: relative;
}

.ticket-header { 
  background: #f1f5f9; padding: 12px 20px; font-size: 0.75rem; 
  font-weight: 800; color: #94a3b8; text-transform: uppercase; 
  letter-spacing: 1.5px; border-bottom: 1px solid #e2e8f0; 
}

.ticket-body { padding: 25px; }

.row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; }
.row .label { color: #94a3b8; font-weight: 500; }
.row .val { color: #1e293b; font-weight: 700; }

.divider { height: 1px; border-top: 2px dashed #cbd5e1; margin: 18px 0; }

.row.total { margin-bottom: 0; align-items: center; }
.row.total span:first-child { color: #1e293b; font-weight: 800; }
.row.total .amount { color: #059669; font-weight: 800; font-size: 1.25rem; }

/* Ticket Punch Effect */
.ticket-punch::before, .ticket-punch::after {
  content: ''; position: absolute; width: 20px; height: 20px; 
  background: #f0fdf4; border-radius: 50%; top: 52%; 
  border: 1px solid #e2e8f0;
}
.ticket-punch::before { left: -11px; box-shadow: inset -3px 0 5px rgba(0,0,0,0.02); }
.ticket-punch::after { right: -11px; box-shadow: inset 3px 0 5px rgba(0,0,0,0.02); }

/* Actions */
.actions { display: flex; flex-direction: column; gap: 10px; }
.text-gray-btn { color: #94a3b8 !important; }
.text-gray-btn:hover { color: #64748b !important; }

@keyframes popIn { 
  0% { transform: scale(0) rotate(-20deg); opacity: 0; } 
  100% { transform: scale(1) rotate(0); opacity: 1; } 
}

@media (max-width: 480px) {
  .card { padding: 40px 20px; }
  .title { font-size: 1.5rem; }
}
</style>