<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="review-modal-overlay" @click.self="closeModal">
        <div class="review-modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              <Icon icon="mdi:star-outline" width="28" />
              Tulis Ulasan
            </h2>
            <button class="close-btn" @click="closeModal">
              <Icon icon="mdi:close" width="24" />
            </button>
          </div>

          <div class="modal-body">
            <div class="kost-info">
              <img :src="kostImage" :alt="kostName" class="kost-thumb" />
              <div class="kost-details">
                <p class="kost-name">{{ kostName }}</p>
                <p class="kost-location">{{ kostLocation }}</p>
              </div>
            </div>

            <div class="divider"></div>

            <div class="rating-section">
              <label class="section-label">Berikan Rating</label>
              <div class="stars-input">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star-btn"
                  @click="rating = star"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >
                  <Icon
                    icon="mdi:star"
                    :class="star <= (hoverRating || rating) ? 'filled' : 'empty'"
                    width="40"
                  />
                </button>
              </div>
              <p class="rating-text">{{ ratingText }}</p>
            </div>

            <div class="comment-section">
              <label class="section-label">
                Tulis Komentar <span class="required">*</span>
              </label>
              <textarea
                v-model="comment"
                class="comment-textarea"
                placeholder="Ceritakan pengalaman Anda di kost ini..."
                rows="5"
                maxlength="1000"
              ></textarea>
              <p class="char-count">{{ comment.length }} / 1000 karakter</p>
            </div>

            <div v-if="errorMessage" class="error-message">
              <Icon icon="mdi:alert-circle" width="20" />
              {{ errorMessage }}
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal" :disabled="submitting">
              Batal
            </button>
            <button
              class="btn-submit"
              @click="submitReview"
              :disabled="!canSubmit || submitting"
            >
              <Icon v-if="submitting" icon="mdi:loading" class="spin" width="20" />
              <span>{{ submitting ? 'Mengirim...' : 'Kirim Ulasan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';
import api from '@/api/Axios';
import Swal from 'sweetalert2';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  // Gunakan [Number, String] untuk menghindari error NaN dari URL query
  kostId: { type: [Number, String], required: true },
  kostName: { type: String, default: 'Kost' },
  kostLocation: { type: String, default: '' },
  kostImage: { type: String, default: 'https://placehold.co/100x100?text=Kost' }
});

const emit = defineEmits(['close', 'reviewSubmitted']);

const rating = ref(0);
const hoverRating = ref(0);
const comment = ref('');
const submitting = ref(false);
const errorMessage = ref('');

const ratingText = computed(() => {
  const texts = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'];
  return texts[rating.value] || 'Pilih rating Anda';
});

const canSubmit = computed(() => {
  return rating.value > 0 && comment.value.trim().length >= 10;
});

const closeModal = () => {
  if (!submitting.value) {
    emit('close');
    // Reset form setelah modal tertutup
    setTimeout(() => {
      rating.value = 0;
      hoverRating.value = 0;
      comment.value = '';
      errorMessage.value = '';
    }, 300);
  }
};

const submitReview = async () => {
  if (!canSubmit.value) {
    errorMessage.value = 'Rating dan komentar (min. 10 karakter) wajib diisi';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    // ✅ FIX 405: Sesuaikan endpoint ke /reviews sesuai routes/api.php Anda
    // Kirim kost_id di dalam body, bukan di URL
    const response = await api.post('/reviews', {
      kost_id: parseInt(props.kostId), // Pastikan menjadi Integer
      rating: rating.value,
      comment: comment.value.trim()
    });

    if (response.data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Terima Kasih!',
        text: 'Ulasan Anda berhasil dikirim',
        confirmButtonColor: '#1e3a8a'
      });

      emit('reviewSubmitted', response.data.data);
      closeModal();
    }
  } catch (error) {
    // Log error lengkap untuk debugging
    console.error("❌ Error submit review:", error.response);

    if (error.response?.status === 405) {
       errorMessage.value = 'Metode pengiriman salah. Hubungi admin (Error 405).';
    } else if (error.response?.status === 403) {
      errorMessage.value = error.response.data.message || 'Anda tidak memiliki akses (Pastikan sudah bayar kos ini)';
    } else if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors).flat().join(', ');
    } else {
      errorMessage.value = error.response?.data?.message || 'Gagal mengirim ulasan. Silakan coba lagi.';
    }
  } finally {
    submitting.value = false;
  }
};

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.review-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.review-modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 8px;
  transition: 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

.kost-info {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.kost-thumb {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.kost-details {
  flex: 1;
  min-width: 0;
}

.kost-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kost-location {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 24px 0;
}

.section-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 1rem;
}

.required {
  color: #ef4444;
}

.rating-section {
  margin-bottom: 24px;
}

.stars-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn .filled {
  color: #fbbf24;
}

.star-btn .empty {
  color: #e5e7eb;
}

.rating-text {
  color: #1e3a8a;
  font-weight: 600;
  margin: 0;
}

.comment-section {
  margin-bottom: 16px;
}

.comment-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #1e3a8a;
}

.comment-textarea::placeholder {
  color: #94a3b8;
}

.char-count {
  text-align: right;
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 8px 0 0 0;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-submit {
  background: #1e3a8a;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: #172554;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.btn-submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .review-modal-content,
.modal-leave-active .review-modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .review-modal-content,
.modal-leave-to .review-modal-content {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .modal-title {
    font-size: 1.25rem;
  }

  .kost-thumb {
    width: 60px;
    height: 60px;
  }

  .stars-input {
    gap: 4px;
  }

  .star-btn svg {
    width: 32px;
    height: 32px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>