<template>
  <div class="user-page">
    <div class="header">
      <h1>Manajemen Pengguna</h1>
      <p>Kelola data pemilik dan penyewa.</p>
    </div>

    <div class="card filters-card">
      <div class="filters-container">
        <div class="search-box">
          <Icon icon="mdi:magnify" width="20" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari nama atau email..." 
            @input="debounceSearch"
          />
        </div>

        <div class="filter-group">
          <label>Filter Role:</label>
          <select v-model="selectedRole" @change="handleFilterChange">
            <option value="">Semua Role</option>
            <option value="owner">Owner</option>
            <option value="tenant">Tenant</option>
          </select>
        </div>

        <BaseButton 
          variant="primary" 
          @click="fetchUsers" 
          :loading="loading"
        >
          <template #icon-left><Icon icon="mdi:refresh" /></template>
          Refresh
        </BaseButton>
      </div>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-container">
        <BaseSkeleton width="50px" height="50px" type="circle" class="mb-2" />
        <p>Memuat data pengguna...</p>
      </div>

      <div v-else>
        <table class="user-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Bergabung</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-info">
                  <div class="avatar">
                    <img v-if="user.avatar" :src="getAvatarUrl(user.avatar)" alt="Avatar" />
                    <span v-else>{{ getInitials(user.name) }}</span>
                  </div>
                  <span>{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="user.role">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td class="text-center">
                <div class="action-buttons">
                  <BaseButton 
                    variant="ghost" 
                    icon 
                    @click="viewUserDetail(user.id)"
                    class="btn-detail-style"
                  >
                    <Icon icon="mdi:eye" width="18" />
                  </BaseButton>

                  <BaseButton 
                    v-if="user.role !== 'admin'"
                    variant="danger" 
                    icon 
                    @click="confirmDeleteUser(user)"
                    class="btn-delete-style"
                  >
                    <Icon icon="mdi:delete" width="18" />
                  </BaseButton>
                </div>
              </td>
            </tr>
            
            <tr v-if="users.length === 0">
              <td colspan="5" class="text-center">
                Tidak ada data ditemukan.
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination.total > 0" class="pagination">
          <BaseButton 
            variant="outline" 
            size="sm"
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
          >
            <template #icon-left><Icon icon="mdi:chevron-left" /></template>
            Prev
          </BaseButton>

          <div class="page-info">
            Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
          </div>

          <BaseButton 
            variant="outline" 
            size="sm"
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
          >
            Next
            <template #icon-right><Icon icon="mdi:chevron-right" /></template>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { notify } from '@/utils/swal';
import adminService from '@/services/adminService';
import Swal from 'sweetalert2';

const users = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedRole = ref('');
const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 });

const API_URL = import.meta.env.VITE_API_URL || 'https://kodyakostapi.adityavisual.my.id/api';
const BASE_STORAGE_URL = API_URL.replace(/\/api\/?$/, '');

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = { page: pagination.value.current_page };
    if (selectedRole.value) params.role = selectedRole.value;
    if (searchQuery.value) params.search = searchQuery.value;

    const response = await adminService.getAllUsers(params);
    if (response.success && response.data) {
      users.value = response.data.data || [];
      pagination.value = {
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
        total: response.data.total || 0
      };
    }
  } catch (err) {
    notify.error("Gagal memuat data pengguna.");
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  let timeout;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    pagination.value.current_page = 1;
    fetchUsers();
  }, 500);
};

const handleFilterChange = () => {
  pagination.value.current_page = 1;
  fetchUsers();
};

const changePage = (p) => {
  if (p >= 1 && p <= pagination.value.last_page) {
    pagination.value.current_page = p;
    fetchUsers();
  }
};

const viewUserDetail = async (id) => {
  try {
    const d = await adminService.getUserDetail(id);
    Swal.fire({ title: 'Detail User', html: `<p><strong>Nama:</strong> ${d.name}</p>`, icon: 'info' });
  } catch (e) { notify.error('Gagal muat detail.'); }
};

const confirmDeleteUser = (u) => {
  notify.confirm("Hapus User?", `Yakin hapus ${u.name}?`, "Hapus", "warning")
    .then(async (ok) => {
      if (ok) {
        try {
          await adminService.deleteUser(u.id);
          notify.success("User dihapus.");
          fetchUsers();
        } catch (e) { notify.error("Gagal hapus."); }
      }
    });
};

const getAvatarUrl = (p) => `${BASE_STORAGE_URL}/storage/${p}`;
const getInitials = (n) => n ? n.substring(0, 2).toUpperCase() : 'U';
const formatRole = (r) => ({ owner: 'Owner', tenant: 'Tenant' }[r] || r);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

onMounted(fetchUsers);
</script>

<style scoped>
/* PERTAHANKAN STYLE ASLI 100% */
.user-page { padding: 2rem; max-width: 1400px; margin: 0 auto; font-family: 'Poppins', sans-serif; }
.header { margin-bottom: 1.5rem; }
.header h1 { color: #1e3a8a; font-size: 1.75rem; font-weight: 700; }
.card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
.filters-container { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.search-box { display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; flex: 1; }
.search-box input { border: none; background: transparent; outline: none; flex: 1; font-size: 0.9rem; }
.user-table { width: 100%; border-collapse: collapse; }
.user-table th { text-align: left; padding: 1rem; background: #f8fafc; color: #64748b; font-size: 0.85rem; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
.user-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
.user-info { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.avatar { width: 36px; height: 36px; background: #eff6ff; color: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; overflow: hidden; }
.badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.badge.owner { background: #fef3c7; color: #b45309; }
.badge.tenant { background: #dbeafe; color: #1e40af; }

/* STYLE TOMBOL AKSI BIAR KELIHATAN MENTERENG */
.action-buttons { display: flex; gap: 0.5rem; justify-content: center; }
.btn-detail-style { background: #dbeafe !important; color: #1e40af !important; border-radius: 8px !important; }
.btn-delete-style { background: #fee2e2 !important; color: #dc2626 !important; border-radius: 8px !important; }

.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
.loading-container { display: flex; flex-direction: column; align-items: center; padding: 3rem; }
</style>