# ADHD阅读助手 - 智能学习辅助平台

一个专为ADHD学生和阅读障碍者设计的智能学习辅助平台，集成了AI技术来提供个性化的学习支持。

## 🌟 主要功能

### 📚 智能阅读助手
- 文本复杂度分析
- 个性化阅读内容生成
- 阅读进度跟踪
- 多感官阅读体验

### ✅ 智能任务管理
- AI任务分解
- 进度可视化
- 提醒系统
- 完成度统计

### 😊 情绪分析
- 情绪状态记录
- 智能情绪分析
- 情绪趋势图表
- 个性化建议

### 😴 睡眠助手
- 睡眠质量记录
- 睡眠模式分析
- 放松音频
- 睡眠建议

### 🤖 AI智能助手
- 24/7智能问答
- 个性化学习建议
- 行为模式预测
- 智能内容推荐

## 🚀 技术栈

### 前端
- **React 18** - 用户界面框架
- **Ant Design** - UI组件库
- **React Router** - 路由管理
- **Recharts** - 数据可视化
- **Axios** - HTTP客户端

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web框架
- **智谱AI** - AI服务集成
- **文件系统** - 数据存储

## 📦 安装部署

### 本地开发

1. **克隆项目**
```bash
git clone <your-repo-url>
cd trae
```

2. **安装依赖**
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client && npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，配置智谱AI API密钥
ZHIPU_AI_API_KEY=your_api_key_here
```

4. **启动开发服务器**
```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run server  # 后端 (端口5001)
npm run client  # 前端 (端口3000)
```

### Vercel部署

1. **连接GitHub仓库**
   - 将代码推送到GitHub
   - 在Vercel中导入项目

2. **配置环境变量**
   - 在Vercel项目设置中添加环境变量
   - 配置智谱AI API密钥

3. **自动部署**
   - Vercel会自动检测代码变更
   - 自动构建和部署

## 🔧 项目结构

```
trae/
├── client/                 # React前端应用
│   ├── public/            # 静态资源
│   ├── src/               # 源代码
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   └── App.js         # 主应用组件
│   └── package.json       # 前端依赖
├── data/                  # 数据存储
├── services/              # 后端服务
│   ├── aiService.js       # AI服务
│   └── zhipuAI.js         # 智谱AI集成
├── server.js              # Express服务器
├── vercel.json            # Vercel配置
└── package.json           # 后端依赖
```

## 🎯 核心特性

### 无障碍设计
- 高对比度模式
- 大字体支持
- 键盘导航
- 语音辅助

### 个性化体验
- 用户偏好设置
- 学习进度跟踪
- 智能推荐系统
- 自适应界面

### AI智能支持
- 自然语言处理
- 情感分析
- 学习模式识别
- 个性化建议

## 📊 API接口

### 用户管理
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户信息

### 任务管理
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务

### AI服务
- `POST /api/ai/chat` - AI对话
- `GET /api/ai/daily-tips/:userId` - 每日建议
- `POST /api/ai/task-decompose` - 任务分解

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [智谱AI](https://open.bigmodel.cn/) - 提供AI服务支持
- [Ant Design](https://ant.design/) - 优秀的UI组件库
- [React](https://reactjs.org/) - 强大的前端框架

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 项目Issues: [GitHub Issues](https://github.com/your-username/trae/issues)
- 邮箱: your-email@example.com

---

**让学习变得更简单，让每个人都能享受阅读的乐趣！** 📚✨
