<template>
  <div class="notification-page">
    <!-- 通知页面内容 -->
    <h2>消息中心</h2>
    <p>您的消息通知</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Notification page mounted')
})
</script>

<style scoped>
.notification-page {
  padding: 20px;
}
</style>
