<template>
  <div class="header">
    <!-- Logo -->
    <div class="logo">
      <router-link to="/">
        <span class="logo-text">VideoSite</span>
      </router-link>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-box">
      <el-input 
        v-model="searchText" 
        placeholder="搜索视频" 
        @keyup.enter="handleSearch"
        clearable
      >
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 右侧功能区 -->
    <div class="user-menu">
      <!-- 消息通知 -->
      <el-dropdown @command="handleCommand">
        <span class="user-menu-item">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0">
            <el-icon class="icon-large"><Bell /></el-icon>
          </el-badge>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="notification">消息中心</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 大会员 -->
      <el-dropdown @command="handleCommand">
        <span class="user-menu-item vip">
          <el-icon class="icon-large"><Crown /></el-icon>
          <span class="vip-text">大会员</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="vip">会员中心</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 动态 -->
      <el-dropdown @command="handleCommand">
        <span class="user-menu-item">
          <el-icon class="icon-large"><ChatLineSquare /></el-icon>
          <span>动态</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="moment">全部动态</el-dropdown-item>
            <el-dropdown-item command="publishMoment">发布动态</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 创作中心 -->
      <el-dropdown @command="handleCommand">
        <span class="user-menu-item">
          <el-icon class="icon-large"><Edit /></el-icon>
          <span>投稿</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="upload">上传视频</el-dropdown-item>
            <el-dropdown-item command="creator">创作中心</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 用户头像 -->
      <el-dropdown @command="handleCommand">
        <span class="user-menu-item user-avatar">
          <el-avatar :size="40" :src="getAvatarUrl(loginStore.userInfo.avatar)">
            {{ loginStore.userInfo.nickName?.charAt(0) || '用' }}
          </el-avatar>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="history">历史记录</el-dropdown-item>
            <el-dropdown-item command="collect">我的收藏</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import { useLoginStore } from '@/stores/loginStore'
import { Bell, Crown, Edit, Search, ChatLineSquare } from '@element-plus/icons-vue'

const router = useRouter()
const loginStore = useLoginStore()
const Request = inject('Request')
const Api = inject('Api')

// 获取完整的头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return '/default-avatar.png'
  
  // 如果已经是完整的URL，则直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  
  // 添加完整的域名和端口
  const baseUrl = 'http://localhost:8080'
  return `${baseUrl}${avatar}`
}

// 搜索文本
const searchText = ref('')

// 未读消息数
const unreadCount = ref(0)

// 搜索处理
const handleSearch = () => {
  if (searchText.value.trim()) {
    // 跳转到搜索结果页面
    router.push({
      path: '/search',
      query: { keyword: searchText.value }
    })
  }
}

// 菜单命令处理
const handleCommand = (command) => {
  switch (command) {
    case 'notification':
      router.push('/chat')
      // 进入消息中心后重置未读消息数
      unreadCount.value = 0
      break
    case 'vip':
      router.push('/vip')
      break
    case 'upload':
      router.push('/upload')
      break
    case 'creator':
      router.push('/creator')
      break
    case 'moment':
      router.push('/moment')
      break
    case 'publishMoment':
      router.push('/moment/publish')
      break
    case 'profile':
      router.push('/profile')
      break
    case 'history':
      router.push('/history')
      break
    case 'collect':
      router.push('/collect')
      break
    case 'logout':
      loginStore.logout()
      router.push('/login')
      break
    default:
      console.log('未知命令:', command)
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  if (loginStore.userInfo.userId) {
    try {
      const result = await Request({
        url: Api.getUserInfo,
        params: { userId: loginStore.userInfo.userId }
      })
      if (result) {
        loginStore.saveUserInfo(result.data)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }
}

// 加载未读消息数
const loadUnreadCount = async () => {
  if (loginStore.userInfo.userId) {
    try {
      // 这里使用获取会话列表的API，因为它会返回每个会话的未读消息数
      // 我们可以计算总和作为总未读消息数
      const result = await Request({
        url: Api.getSessions,
        params: { userId: loginStore.userInfo.userId }
      })
      if (result && result.success && result.data) {
        // 计算总未读消息数
        unreadCount.value = result.data.reduce((sum, session) => sum + (session.unreadCount || 0), 0)
        console.log('未读消息数:', unreadCount.value)
      }
    } catch (error) {
      console.error('加载未读消息数失败:', error)
    }
  }
}

onMounted(() => {
  loadUserInfo()
  loadUnreadCount()
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.logo-text {
  color: #1890ff;
  text-decoration: none;
}

.search-box {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-menu-item {
  display: flex;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

/* 消息通知的样式调整 */
.user-menu-item .el-badge {
  margin-right: 0;
}

.user-menu-item:hover {
  color: #1890ff;
}

.icon-large {
  font-size: 20px;
}

.vip {
  color: #f90;
}

.vip-text {
  margin-left: 5px;
  font-weight: bold;
}

.user-avatar {
  margin-left: 10px;
}
</style>
