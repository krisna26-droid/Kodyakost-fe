<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/Axios'

const rawResponse = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await api.get('/mock-kosts')
    rawResponse.value = res.data
    console.log('API RESPONSE:', res.data)
  } catch (err) {
    error.value = err
    console.error('API ERROR:', err)
  }
})
</script>

<template>
  <div style="padding: 20px">
    <h1>API TEST PAGE</h1>

    <p v-if="error" style="color: red">
      ❌ ERROR: {{ error.message }}
    </p>

    <pre v-else-if="rawResponse">
{{ JSON.stringify(rawResponse, null, 2) }}
    </pre>

    <p v-else>⏳ Loading...</p>
  </div>
</template>
