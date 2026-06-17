# 计算机 2203 班毕业去向可视化纪念页

这是武汉理工大学计算机与人工智能学院 **计算机 2203 班** 的毕业去向可视化纪念页。

项目希望用一个轻量、温暖、可长期维护的网页，记录大家从武汉理工出发，走向不同城市、不同学校、不同单位、不同人生阶段的轨迹。页面包含封面视频、籍贯地图、毕业去向地图、总览筛选地图、同学卡片和班级照片墙。

在线访问：

```text
https://fanzhbill.github.io/wut-jsj2203/
```

## 欢迎大家更新自己的去向

如果你是计科 2203 班同学，欢迎补充或更新自己的毕业去向信息。

可以更新的内容包括：

- 姓名展示
- 毕业去向类别：升学、就业、考公、留学、其他等
- 目标学校、单位、城市或地区
- 专业、岗位、研究方向等简短说明
- 籍贯城市和毕业去向城市

如果你发现页面中自己的信息不准确、不完整，或者暂时不希望公开某些信息，也欢迎及时反馈。这个页面的目的不是排名或比较，而是为班级留下一个共同的毕业纪念。

## 如何提交更新

推荐方式：

1. 在 GitHub 仓库提交 Issue，说明需要更新的信息。
2. 或直接提交 Pull Request，修改：

   ```text
   src/data/students.json
   ```

每位同学的数据大致包含：

```json
{
  "name": "姓名",
  "category": "升学/就业/考公/留学/其他",
  "destination": "学校、单位或去向",
  "roleOrMajor": "专业、岗位或补充说明",
  "hometownProvince": "籍贯省份",
  "hometownCity": "籍贯城市",
  "destinationProvince": "去向省份",
  "destinationCity": "去向城市"
}
```

如新增城市无法在地图上显示，请同时在这里补充坐标：

```text
src/data/cityCoords.json
```

示例：

```json
"武汉": [114.305392, 30.593098]
```

## 页面内容

- **封面视频**：作为纪念页入口，保留班级毕业氛围。
- **籍贯汇聚地图**：展示大家从哪里来到武汉理工。
- **毕业去向地图**：展示大家毕业后去往哪些城市。
- **总览筛选地图**：按去向类别查看整体分布。
- **同学卡片**：以卡片形式展示个人去向信息。
- **照片墙**：保存班级共同记忆。

## 隐私说明

请只提交适合公开展示的信息。若你希望隐藏、修改或删除自己的信息，可以通过 Issue、Pull Request 或联系仓库维护者处理。

## 本地运行

项目基于 Vue 3、Vite 和 ECharts。

```bash
npm install
npm run dev
```

常用命令：

```bash
npm test
npm run build
```

## GitHub Pages 部署

项目已配置 GitHub Actions，可自动部署到 GitHub Pages。

本地构建项目站点时，可设置仓库路径：

```bash
VITE_BASE=/wut-jsj2203/ npm run build
```

## 媒体文件位置

- 封面视频：`public/videos/hero-video.mp4`
- 校园图：`public/images/whut-campus.jpg`
- 照片墙：`public/images/photos/class-photo-*.webp`
- 中国地图：`public/maps/china.json`

当前项目不依赖后端、数据库、背景音乐文件或付费 API，适合长期静态托管。
