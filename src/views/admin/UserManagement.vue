<template>
  <div class="user-page">
    <div class="header">
      <h1>Manajemen Pengguna</h1>
      <p>Kelola data pemilik dan penyewa.</p>
    </div>

    <div class="card">
      <table class="user-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Bergabung</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td>
              <div class="user-info">
                <div class="avatar">U{{i}}</div>
                <span>User Demo {{ i }}</span>
              </div>
            </td>
            <td>user{{i}}@example.com</td>
            <td>
              <span class="badge" :class="i % 2 === 0 ? 'owner' : 'tenant'">
                {{ i % 2 === 0 ? 'Owner' : 'Tenant' }}
              </span>
            </td>
            <td>25 Jan 2026</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.user-page { padding: 2rem; font-family: 'Poppins', sans-serif; }
.header { margin-bottom: 2rem; }
.header h1 { color: #1e3a8a; font-size: 1.5rem; font-weight: 700; }
.header p { color: #64748b; }

.card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }

.user-table { width: 100%; border-collapse: collapse; }
.user-table th { text-align: left; padding: 1rem; background: #f8fafc; color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 700; }
.user-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; }

.user-info { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.avatar { width: 32px; height: 32px; background: #eff6ff; color: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }

.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.badge.owner { background: #fef3c7; color: #b45309; }
.badge.tenant { background: #dbeafe; color: #1e40af; }
</style>