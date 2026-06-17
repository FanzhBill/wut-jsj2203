# 计算机2203班毕业去向可视化纪念页

武汉理工大学计算机与人工智能学院计算机2203班毕业去向可视化纪念页。项目基于 Vue 3 + Vite + ECharts，可部署到 GitHub Pages。页面包含封面视频、籍贯汇聚地图、毕业去向地图、总览筛选地图、同学卡片、照片墙、音乐按钮和分屏导航。

## 安装与运行

```bash
npm install
npm run dev
npm test
npm run build
```

## GitHub Pages 部署

项目站点部署时推荐设置 base：

```bash
VITE_BASE=/你的仓库名/ npm run build
```

将 `dist/` 发布到 GitHub Pages。也可以使用 GitHub Actions 上传 `dist` 目录。

## 添加同学数据

编辑 `src/data/students.json`，每条记录包含：`name`、`category`、`destination`、`roleOrMajor`、`hometownProvince`、`hometownCity`、`destinationProvince`、`destinationCity`。如新增城市无法在地图上显示，请在 `src/data/cityCoords.json` 中添加坐标：

```json
"武汉": [114.305392, 30.593098]
```

## 本地媒体文件位置

- 封面视频：`public/videos/hero-video.mp4`
- 校园图：`public/images/whut-campus.jpg`（可替换为真实图片）
- 照片墙：`public/images/photos/class-photo-*.webp`
- 中国地图：`public/maps/china.json`

当前封面视频使用 `hero-video.mp4`，照片墙使用压缩后的 `class-photo-*.webp`，不依赖后端、数据库、背景音乐文件或付费 API。
