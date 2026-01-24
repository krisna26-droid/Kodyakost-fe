<template>
  <div class="payment-success-page">
    <div class="card">
      
      <div class="success-animation">
        <Icon icon="mdi:check-decagram" class="check-icon" />
      </div>

      <h1 class="title">Pembayaran Berhasil!</h1>
      <p class="desc">Terima kasih, pembayaran Anda telah terverifikasi otomatis. Kamar Anda sudah siap.</p>

      <div class="ticket">
        <div class="ticket-header">
          <span>Rincian Pesanan</span>
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
      </div>

      <div class="actions">
        <button class="btn-primary" @click="$router.push('/my-bookings')">
          Lihat Tiket & Check-in
        </button>
        <button class="btn-secondary" @click="$router.push('/')">
          Kembali ke Beranda
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>

<style scoped>
.payment-success-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #ecfdf5; padding: 20px; font-family: 'Poppins', sans-serif; }

.card { background: white; width: 100%; max-width: 420px; padding: 40px 30px; border-radius: 20px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }

.success-animation { margin-bottom: 20px; }
.check-icon { font-size: 5rem; color: #10b981; animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

.title { font-size: 1.6rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
.desc { color: #64748b; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.5; }

/* Ticket Style */
.ticket { background: #f8fafc; border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #e2e8f0; text-align: left; }
.ticket-header { background: #f1f5f9; padding: 10px 20px; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; }
.ticket-body { padding: 20px; }

.row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
.row .label { color: #64748b; }
.row .val { color: #1e293b; font-weight: 600; }
.divider { height: 1px; border-top: 2px dashed #cbd5e1; margin: 15px 0; }
.row.total { margin-bottom: 0; align-items: center; }
.row.total .amount { color: #10b981; font-weight: 700; font-size: 1.1rem; }

/* Actions */
.actions { display: flex; flex-direction: column; gap: 12px; }
.btn-primary { width: 100%; background: #1e3a8a; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(30, 58, 138, 0.2); }
.btn-primary:hover { background: #172554; transform: translateY(-2px); }

.btn-secondary { width: 100%; background: transparent; color: #64748b; border: none; font-weight: 600; cursor: pointer; padding: 10px; }
.btn-secondary:hover { color: #1e293b; }

@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>