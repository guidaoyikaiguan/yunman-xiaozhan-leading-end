<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 首页按钮 -->
      <div class="nav-section">
        <div 
          class="nav-item" 
          :class="{ active: currentRoute === '/' }"
          @click="goToHome"
        >
          <el-icon><House /></el-icon>
          <span>首页</span>
        </div>
      </div>
      
      <!-- 分类导航 -->
      <div class="nav-section">
        <div class="nav-section-title">分类</div>
        <div 
          v-for="category in categories" 
          :key="category.categoryId" 
          class="nav-item" 
          :class="{ active: currentRoute.includes(`/category/${category.categoryId}`) }"
          @click="goToCategory(category.categoryId, category.categoryName)"
        >
          <el-icon><VideoCamera /></el-icon>
          <span>{{ category.categoryName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VideoCamera, House } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 注入全局工具
const Request = inject('Request')
const Api = inject('Api')

// 当前路由路径
const currentRoute = computed(() => route.path)

// 分类数据
const categories = ref([])

// 从后端加载分类数据
const loadCategories = async () => {
  try {
    const result = await Request({
      url: Api.loadCategories,
    })
    if (result) {
      categories.value = result.data
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// 跳转到分类页面
const goToCategory = (categoryId, categoryName) => {
  router.push(`/category/${categoryId}?name=${encodeURIComponent(categoryName)}`)
  console.log('Go to category:', categoryId, categoryName)
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
  console.log('Go to home page')
}

// 组件挂载时加载分类数据
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.sidebar {
  width: 200px;
  min-height: calc(100vh - 60px);
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  overflow-y: auto;
  z-index: 80;
}

.sidebar-content {
  padding: 20px 0;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-section-title {
  padding: 0 20px 10px;
  font-size: 14px;
  font-weight: bold;
  color: #999;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.nav-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: bold;
}

.nav-item .el-icon {
  margin-right: 10px;
  font-size: 18px;
}

.nav-divider {
  height: 1px;
  background-color: #e8e8e8;
  margin: 15px 0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .sidebar {
    width: 60px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-section-title {
    display: none;
  }
  
  .nav-item .el-icon {
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>