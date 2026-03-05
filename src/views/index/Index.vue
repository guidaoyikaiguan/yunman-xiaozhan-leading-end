<template>
  <!-- 顶部导航栏 -->
  <Header />
  
  <!-- 左侧导航栏 -->
  <Sidebar />
  
  <!-- 主内容区 -->
  <div class="main-content">
    <!-- 轮播图和视频列表区 -->
    <div class="content-area">
      <!-- 轮播图 -->
      <div class="carousel-container">
        <el-carousel :interval="5000" height="400px">
          <el-carousel-item v-for="(item, index) in carouselList" :key="index">
            <div class="carousel-item">
              <img :src="item.cover" :alt="item.title" />
              <div class="carousel-title">{{ item.title }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      
      <!-- 右侧视频列表 -->
      <div class="right-videos">
        <div class="video-item" v-for="(item, index) in rightVideos" :key="item.id" @click="goToVideoDetail(item)">
          <div class="video-cover-container">
            <img :src="item.cover" :alt="item.title" />
            <div v-if="item.duration" class="video-duration">{{ item.duration }}</div>
          </div>
          <div class="video-title">{{ item.title }}</div>
          <div class="video-author">{{ item.author }}</div>
          <div class="video-stats">
            <span class="play-count">{{ item.playCount || 0 }} 播放</span>
            <span class="upload-date">{{ item.uploadDate || '' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧边视频列表 -->
      <div class="side-videos">
        <div class="video-item" v-for="(item, index) in sideVideos" :key="item.id" @click="goToVideoDetail(item)">
          <div class="video-cover-container">
            <img :src="item.cover" :alt="item.title" />
            <div v-if="item.duration" class="video-duration">{{ item.duration }}</div>
          </div>
          <div class="video-title">{{ item.title }}</div>
          <div class="video-author">{{ item.author }}</div>
          <div class="video-stats">
            <span class="play-count">{{ item.playCount || 0 }} 播放</span>
            <span class="upload-date">{{ item.uploadDate || '' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 下方视频列表 -->
    <div class="bottom-videos">
      <div class="video-item" v-for="(item, index) in bottomVideos" :key="item.id" @click="goToVideoDetail(item)">
          <div class="video-cover-container">
            <img :src="item.cover" :alt="item.title" />
            <div v-if="item.duration" class="video-duration">{{ item.duration }}</div>
          </div>
          <div class="video-title">{{ item.title }}</div>
          <div class="video-author">{{ item.author }}</div>
          <div class="video-stats">
            <span class="play-count">{{ item.playCount || 0 }} 播放</span>
            <span class="upload-date">{{ item.uploadDate || '' }}</span>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useNavAction } from '@/stores/navActionStore'
import { ref, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const navActionStore = useNavAction()
const router = useRouter()
const route = useRoute()

// 注入全局工具
const Request = inject('Request')
const Api = inject('Api')

// 轮播图数据
const carouselList = ref([])

// 右侧视频列表数据
const rightVideos = ref([])

// 右侧边视频列表数据
const sideVideos = ref([])

// 下方视频列表数据
const bottomVideos = ref([])

// 当前分类ID
const currentCategoryId = ref(null)

// 当前分类名称
const currentCategoryName = ref('推荐')

// 分页状态
const pageNo = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasMore = ref(true)
const videos = ref([]) // 所有视频数据

// 加载轮播图数据
const loadCarousel = async () => {
  try {
    const result = await Request({
      url: '/api/carousel/getCarousel'
    })
    console.log('Carousel data:', result)
    
    if (result && result.success && result.data) {
      // 直接使用后端返回的数据，后端已经处理了URL
      carouselList.value = result.data;
      console.log('Processed carousel data:', carouselList.value);
    }
  } catch (error) {
    console.error('Failed to load carousel:', error);
  }
}

// 加载推荐视频
const loadRecommendVideo = async (isLoadMore = false) => {
  if (loading.value || !hasMore.value) return;
  
  loading.value = true;
  try {
    const result = await Request({
      url: Api.loadRecommendVideo,
      params: {
        pageNo: pageNo.value,
        pageSize: pageSize.value
      }
    })
    console.log('Recommend video data:', result)
    if (result && result.data && result.data.list) {
      const newVideos = result.data.list || [];
      const totalCount = result.data.totalCount || 0;
      
      if (isLoadMore) {
        // 加载更多：追加到视频列表
        videos.value = [...videos.value, ...newVideos];
      } else {
        // 首次加载：替换视频列表
        videos.value = newVideos;
      }
      
      // 更新分页状态
      pageNo.value++;
      hasMore.value = (pageNo.value - 1) * pageSize.value < totalCount;
      
      // 处理并显示视频
      processVideoData();
    } else {
      console.error('Invalid response data:', result);
      hasMore.value = false;
    }
  } catch (error) {
    console.error('Failed to load recommend videos:', error)
  } finally {
    loading.value = false;
  }
}

// 按分类加载视频
const loadVideosByCategory = async (categoryId, categoryName) => {
  try {
    console.log('Loading videos by category:', categoryId, categoryName)
    console.log('API URL:', Api.loadVideoByCategory)
    const result = await Request({
      url: '/api/video/loadVideoByCategory',
      params: { categoryId }
    })
    console.log('Videos by category:', result)
    if (result && result.data) {
      console.log('Video items:', result.data)
      processVideoData(result.data)
      currentCategoryId.value = categoryId
      currentCategoryName.value = categoryName
    }
  } catch (error) {
    console.error('Failed to load videos by category:', error)
  }
}

// 处理视频数据
const processVideoData = (newVideos) => {
  let processedVideos;
  
  if (newVideos) {
    // 如果有新数据，直接使用
    processedVideos = newVideos.map(video => {
      // 检查封面路径是否已经是完整URL
      let coverUrl = video.coverUrl || video.cover || '';
      if (coverUrl && !coverUrl.startsWith('http')) {
        // 添加完整URL前缀
        coverUrl = `http://localhost:8080${coverUrl}`;
      }
      // 提取作者名字，支持多种字段名：nickName、nickname、author、username
      const authorName = video.nickName || video.nickname || video.author || video.username || '未知作者';
      // 处理上传时间
      let uploadDate = ''
      if (video.createTime) {
        try {
          const date = new Date(video.createTime)
          uploadDate = date.toISOString().split('T')[0].replace(/-/g, '-')
        } catch (e) {
          console.error('Failed to parse createTime:', e)
        }
      }
      
      return {
        title: video.title,
        cover: coverUrl,
        author: authorName, // 提取作者名字
        playCount: video.playCount || video.viewCount || 0, // 播放数
        uploadDate: uploadDate, // 上传时间
        duration: video.duration, // 视频时长
        id: video.videoId || video.id || Math.random().toString(36).substr(2, 9), // 确保有唯一ID
        videoId: video.videoId || video.id // 保留原始视频ID
      }
    });
  } else {
    // 否则使用videos数组
    processedVideos = videos.value.map(video => {
      // 检查封面路径是否已经是完整URL
      let coverUrl = video.coverUrl || video.cover || '';
      if (coverUrl && typeof coverUrl === 'string' && !coverUrl.startsWith('http')) {
        // 添加完整URL前缀
        coverUrl = `http://localhost:8080${coverUrl}`;
      }
      // 提取作者名字，支持多种字段名：nickName、nickname、author、username
      const authorName = video.nickName || video.nickname || video.author || video.username || '未知作者';
      // 处理上传时间
      let uploadDate = ''
      if (video.createTime) {
        try {
          const date = new Date(video.createTime)
          uploadDate = date.toISOString().split('T')[0].replace(/-/g, '-')
        } catch (e) {
          console.error('Failed to parse createTime:', e)
        }
      }
      
      return {
        title: video.title,
        cover: coverUrl,
        author: authorName, // 提取作者名字
        playCount: video.playCount || video.viewCount || 0, // 播放数
        uploadDate: uploadDate, // 上传时间
        duration: video.duration, // 视频时长
        id: video.videoId || video.id || Math.random().toString(36).substr(2, 9), // 确保有唯一ID
        videoId: video.videoId || video.id // 保留原始视频ID
      }
    });
  }
  
  // 右侧视频列表（前4个）
  rightVideos.value = processedVideos.slice(0, 4)
  // 右侧边视频列表（接下来的2个）
  sideVideos.value = processedVideos.slice(4, 6)
  // 下方视频列表（剩余的所有视频）
  bottomVideos.value = processedVideos.slice(6)
}

// 检查是否需要加载更多
const checkNeedLoadMore = () => {
  // 计算当前显示的视频数量
  const currentCount = 1 + rightVideos.value.length + sideVideos.value.length + bottomVideos.value.length;
  
  // 如果当前显示的视频少于30个，且还有更多数据，继续加载
  if (currentCount < 30 && hasMore.value && !loading.value) {
    loadRecommendVideo(true);
  }
};

// 跳转到视频详情页
const goToVideoDetail = (video) => {
  if (video.videoId) {
    router.push(`/video/${video.videoId}`)
  }
}

// 滚动监听
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const clientHeight = document.documentElement.clientHeight || window.innerHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadRecommendVideo(true);
  }
};

onMounted(() => {
  navActionStore.setShowHeader(true)
  navActionStore.setFixedHeader(true)
  navActionStore.setFixedCategory(false)
  navActionStore.setShowCategory(false)
  navActionStore.setForceFixedHeader(false)
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
  
  // 加载轮播图数据
  loadCarousel()
  // 加载推荐视频
  loadRecommendVideo().then(() => {
    // 首次加载完成后，检查是否需要加载更多
    setTimeout(() => {
      checkNeedLoadMore();
    }, 500);
  })
});

// 移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/category/')) {
    const categoryId = parseInt(newPath.split('/')[2])
    const categoryName = route.query.name || '分类'
    loadVideosByCategory(categoryId, categoryName)
  } else if (newPath === '/') {
    // 重置到推荐视频
    currentCategoryId.value = null
    currentCategoryName.value = '推荐'
    pageNo.value = 1
    hasMore.value = true
    videos.value = []
    loadRecommendVideo().then(() => {
      // 首次加载完成后，检查是否需要加载更多
      setTimeout(() => {
        checkNeedLoadMore();
      }, 500);
    })
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
/* 主内容区需要为固定的头部留出空间 */
.main-content {
  margin-top: 60px; /* 60px header */
  margin-left: 200px; /* 200px sidebar */
  padding: 0 20px;
  min-height: calc(100vh - 60px);
}

/* 内容区域 */
.content-area {
  max-width: calc(100% - 40px);
  margin: 20px auto;
  display: grid;
  grid-template-columns: 640px 1fr 240px;
  grid-template-rows: 400px;
  grid-template-areas: 
    "carousel right side";
  gap: 16px;
}

/* 轮播图容器 */
.carousel-container {
  grid-area: carousel;
  width: 100%;
  max-width: 640px;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: left;
  z-index: 10;
}

/* 右侧视频列表 */
.right-videos {
  grid-area: right;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  align-items: start;
}

/* 右侧边视频列表 */
.side-videos {
  grid-area: side;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 下方视频列表 */
.bottom-videos {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 0 20px;
}

/* 视频项 */
.video-item {
  width: 100%;
  max-width: 240px;
  min-height: 180px;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  background: white;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.video-cover-container {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.video-cover-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 1;
}

.video-title {
  padding: 8px 8px 4px 8px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  display: flex;
  align-items: center;
}

.video-author {
  padding: 0 8px 4px 8px;
  background: white;
  font-size: 11px;
  color: #999;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  display: flex;
  align-items: center;
}

/* 视频统计信息 */
.video-stats {
  padding: 0 8px 8px 8px;
  background: white;
  font-size: 10px;
  color: #999;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.play-count {
  display: block;
}

.upload-date {
  display: block;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-area {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: 
      "carousel right";
    gap: 16px;
  }
  
  .side-videos {
    display: none;
  }
  
  .carousel-container {
    width: 100%;
  }
  
  .video-item {
    max-width: none;
  }
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 60px; /* 60px sidebar (collapsed) */
  }
  
  .content-area {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    grid-template-areas: 
      "carousel"
      "right";
    gap: 16px;
    margin: 20px auto;
  }
  
  .carousel-container {
    width: 100%;
    height: 240px;
  }
  
  .video-item {
    width: 100%;
    max-width: none;
    min-height: 160px;
  }
  
  .video-cover-container {
    height: 80px;
  }
  
  .video-cover-container img {
    height: 80px;
  }
  
  .right-videos {
    gap: 12px;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0; /* 导航栏隐藏 */
  }
  
  .content-area {
    gap: 12px;
    margin: 16px auto;
  }
  
  .right-videos {
    gap: 10px;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .carousel-container {
    height: 200px;
  }
  
  .video-item {
    min-height: 140px;
  }
  
  .video-cover-container {
    height: 70px;
  }
  
  .video-cover-container img {
    height: 70px;
  }
  
  .video-title {
    padding: 6px 6px 3px 6px;
    font-size: 12px;
  }
  
  .video-author {
    padding: 0 6px 4px 6px;
    font-size: 10px;
  }
  
  .video-stats {
    padding: 0 6px 6px 6px;
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .right-videos {
    grid-template-columns: 1fr;
  }
  
  .bottom-videos {
    grid-template-columns: 1fr;
  }
  
  .carousel-container {
    height: 160px;
  }
  
  .video-item {
    min-height: 120px;
  }
  
  .video-cover-container {
    height: 60px;
  }
  
  .video-cover-container img {
    height: 60px;
  }
}
</style>
