<template>
  <div 
    class="base-skeleton" 
    :class="type" 
    :style="{ 
      width: width, 
      height: height, 
      borderRadius: borderRadius 
    }"
  ></div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'rect' }, // 'rect', 'circle', 'text'
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  borderRadius: { type: String, default: '8px' }
});
</script>

<style scoped>
.base-skeleton {
  background: #eee;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 8px;
  background-size: 200% 100%;
  animation: 1.5s shine linear infinite;
}
.circle { border-radius: 50% !important; }
.text { height: 14px; border-radius: 4px; }

@keyframes shine {
  to { background-position-x: -200%; }
}
</style>