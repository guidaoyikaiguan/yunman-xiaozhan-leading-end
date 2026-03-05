// 工具类
const Utils = {
  // 获取本地图片路径
  getLocalImage(fileName) {
    // 假设图片存放在public/images目录下
    return `/images/${fileName}`;
  },
  // 页面边距
  bodyPadding: 20,
  // 轮播最多显示的视频数
  carouselMaxCount: 3
};

export default Utils;