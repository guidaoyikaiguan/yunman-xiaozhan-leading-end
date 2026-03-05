<template>
  <!-- 使用router-view显示当前路由对应的组件 -->
  <router-view />
  <!-- 登录弹窗组件，通过状态管理控制显示，管理端页面不显示 -->
  <Account v-if="!isAdminPage" />
</template>

<script setup>
// 引入Account组件
import Account from './views/account/Account.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 计算是否是管理端页面
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin/')
})
</script>

<style>
/* 全局样式重置（可选） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>