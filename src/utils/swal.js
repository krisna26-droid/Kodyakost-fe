import Swal from 'sweetalert2';

// Toast: Notifikasi melayang kecil di pojok kanan atas
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export const notify = {
  // Sukses Ringan (Login, Tambah Wishlist, Update)
  success: (msg) => Toast.fire({ icon: 'success', title: msg }),
  
  // Gagal/Error Ringan (Form tidak lengkap, koneksi)
  error: (msg) => Toast.fire({ icon: 'error', title: msg }),

  // Alert Sukses Besar (Setelah Verifikasi atau Booking)
  alertSuccess: (title, text) => Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#1e3a8a', // Navy KodyaKost
  }),

  // Konfirmasi Tindakan Berbahaya (Logout, Hapus, Tolak)
  confirm: async (title, text, confirmBtn = 'Ya, Lanjutkan') => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmBtn,
      cancelButtonText: 'Batal'
    });
    return result.isConfirmed;
  }
};