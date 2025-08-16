const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// 导入AI服务
const aiService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// 数据存储文件路径
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const MOOD_FILE = path.join(DATA_DIR, 'mood_records.json');
const READING_FILE = path.join(DATA_DIR, 'reading_contents.json');
const SLEEP_FILE = path.join(DATA_DIR, 'sleep_records.json');

// 初始化数据存储
async function initializeData() {
  await fs.ensureDir(DATA_DIR);
  
  // 初始化各个数据文件
  const files = [USERS_FILE, TASKS_FILE, MOOD_FILE, READING_FILE, SLEEP_FILE];
  for (const file of files) {
    if (!await fs.pathExists(file)) {
      await fs.writeJson(file, []);
    }
  }
  
  console.log('数据存储初始化完成');
}

// 读取数据
async function readData(file) {
  try {
    return await fs.readJson(file);
  } catch (error) {
    return [];
  }
}

// 写入数据
async function writeData(file, data) {
  await fs.writeJson(file, data, { spaces: 2 });
}

// 初始化数据存储
initializeData();

// API 路由

// 用户相关
app.post('/api/users', async (req, res) => {
  const { name, email, preferences } = req.body;
  
  try {
    const users = await readData(USERS_FILE);
    const id = uuidv4();
    const newUser = {
      id,
      name,
      email,
      preferences: preferences || {},
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeData(USERS_FILE, users);
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const users = await readData(USERS_FILE);
    const user = users.find(u => u.id === id);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 任务管理
app.get('/api/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const tasks = await readData(TASKS_FILE);
    const userTasks = tasks.filter(task => task.user_id === userId)
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(userTasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { user_id, title, description, priority, due_date, category } = req.body;
  
  try {
    const tasks = await readData(TASKS_FILE);
    const id = uuidv4();
    const newTask = {
      id,
      user_id,
      title,
      description,
      priority: priority || 1,
      category: category || 'general',
      due_date,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    tasks.push(newTask);
    await writeData(TASKS_FILE, tasks);
    
    // 如果启用AI功能，尝试生成任务分解建议
    if (process.env.AI_FEATURES_ENABLED === 'true') {
      try {
        const aiAnalysis = await aiService.analyzeAndDecomposeTask(newTask);
        newTask.ai_suggestions = aiAnalysis;
      } catch (aiError) {
        console.warn('AI任务分析失败:', aiError.message);
        // AI失败不影响任务创建
      }
    }
    
    res.json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed, title, description, priority, due_date } = req.body;
  
  try {
    const tasks = await readData(TASKS_FILE);
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title,
      description,
      priority,
      completed,
      due_date
    };
    
    await writeData(TASKS_FILE, tasks);
    res.json({ message: '任务更新成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 情绪记录
app.get('/api/mood/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const moodRecords = await readData(MOOD_FILE);
    const userMoods = moodRecords.filter(mood => mood.user_id === userId)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 30);
    res.json(userMoods);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/mood', async (req, res) => {
  const { user_id, mood_score, notes, date } = req.body;
  
  try {
    const moodRecords = await readData(MOOD_FILE);
    const id = uuidv4();
    const newMood = {
      id,
      user_id,
      mood_score,
      notes,
      date,
      created_at: new Date().toISOString()
    };
    
    moodRecords.push(newMood);
    await writeData(MOOD_FILE, moodRecords);
    
    // 如果启用AI功能，生成情绪分析和建议
    if (process.env.AI_FEATURES_ENABLED === 'true') {
      try {
        const aiAnalysis = await aiService.analyzeMoodWithContext(newMood, user_id);
        newMood.ai_analysis = aiAnalysis;
      } catch (aiError) {
        console.warn('AI情绪分析失败:', aiError.message);
      }
    }
    
    res.json(newMood);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 阅读内容
app.get('/api/reading', async (req, res) => {
  const { difficulty, category } = req.query;
  
  try {
    let contents = await readData(READING_FILE);
    
    if (difficulty) {
      contents = contents.filter(content => content.difficulty_level == difficulty);
    }
    
    if (category) {
      contents = contents.filter(content => content.category === category);
    }
    
    contents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(contents);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/reading', async (req, res) => {
  const { title, content, difficulty_level, category } = req.body;
  
  try {
    const contents = await readData(READING_FILE);
    const id = uuidv4();
    const newContent = {
      id,
      title,
      content,
      difficulty_level: difficulty_level || 1,
      category: category || 'general',
      created_at: new Date().toISOString()
    };
    
    contents.push(newContent);
    await writeData(READING_FILE, contents);
    res.json(newContent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 睡眠记录
app.get('/api/sleep/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const sleepRecords = await readData(SLEEP_FILE);
    const userSleep = sleepRecords.filter(sleep => sleep.user_id === userId)
                                 .sort((a, b) => new Date(b.date) - new Date(a.date))
                                 .slice(0, 30);
    res.json(userSleep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/sleep', async (req, res) => {
  const { user_id, bedtime, wake_time, quality_score, notes, date } = req.body;
  
  try {
    const sleepRecords = await readData(SLEEP_FILE);
    const id = uuidv4();
    const newSleep = {
      id,
      user_id,
      bedtime,
      wake_time,
      quality_score,
      notes,
      date,
      created_at: new Date().toISOString()
    };
    
    sleepRecords.push(newSleep);
    await writeData(SLEEP_FILE, sleepRecords);
    
    // 如果启用AI功能，生成睡眠分析和建议
    if (process.env.AI_FEATURES_ENABLED === 'true') {
      try {
        const aiAnalysis = await aiService.analyzeSleepWithContext(newSleep, user_id);
        newSleep.ai_analysis = aiAnalysis;
      } catch (aiError) {
        console.warn('AI睡眠分析失败:', aiError.message);
      }
    }
    
    res.json(newSleep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// AI功能相关API

// AI配置API
app.get('/api/ai/config', (req, res) => {
  try {
    const isConfigured = aiService.isConfigured();
    res.json({ 
      configured: isConfigured,
      model: process.env.ZHIPU_AI_MODEL || 'glm-4',
      baseUrl: process.env.ZHIPU_AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/config', async (req, res) => {
  try {
    const { apiKey, model, baseUrl } = req.body;
    
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({ error: 'API密钥不能为空' });
    }
    
    // 更新环境变量
    process.env.ZHIPU_AI_API_KEY = apiKey;
    if (model) process.env.ZHIPU_AI_MODEL = model;
    if (baseUrl) process.env.ZHIPU_AI_BASE_URL = baseUrl;
    
    // 重新初始化AI服务
    aiService.updateConfig({
      apiKey,
      model: model || 'glm-4',
      baseUrl: baseUrl || 'https://open.bigmodel.cn/api/paas/v4'
    });
    
    res.json({ success: true, message: 'AI配置更新成功' });
  } catch (error) {
    console.error('AI配置更新失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/test', async (req, res) => {
  try {
    const result = await aiService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('AI连接测试失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 智能问答
app.post('/api/ai/question', async (req, res) => {
  const { user_id, question, context } = req.body;
  
  try {
    if (process.env.AI_FEATURES_ENABLED !== 'true') {
      return res.status(503).json({ error: 'AI功能未启用' });
    }
    
    const result = await aiService.handleQuestion(question, user_id, context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取每日个性化建议
app.get('/api/ai/daily-tips/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    if (process.env.AI_FEATURES_ENABLED !== 'true') {
      return res.status(503).json({ error: 'AI功能未启用' });
    }
    
    const result = await aiService.generateDailyTips(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 生成个性化阅读内容
app.post('/api/ai/reading-content', async (req, res) => {
  const { user_id, topic, difficulty } = req.body;
  
  try {
    if (process.env.AI_FEATURES_ENABLED !== 'true') {
      return res.status(503).json({ error: 'AI功能未启用' });
    }
    
    const result = await aiService.generatePersonalizedReading(topic, user_id, difficulty);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 任务智能分解
app.post('/api/ai/task-decompose', async (req, res) => {
  const { task } = req.body;
  
  try {
    if (process.env.AI_FEATURES_ENABLED !== 'true') {
      return res.status(503).json({ error: 'AI功能未启用' });
    }
    
    const result = await aiService.analyzeAndDecomposeTask(task);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 用户行为模式预测
app.get('/api/ai/predict-pattern/:userId/:type', async (req, res) => {
  const { userId, type } = req.params;
  
  try {
    if (process.env.AI_FEATURES_ENABLED !== 'true') {
      return res.status(503).json({ error: 'AI功能未启用' });
    }
    
    const result = await aiService.predictUserPattern(userId, type);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI功能状态检查
app.get('/api/ai/status', (req, res) => {
  const zhipuAI = require('./services/zhipuAI');
  
  res.json({
    ai_enabled: process.env.AI_FEATURES_ENABLED === 'true',
    api_configured: zhipuAI.isConfigured(),
    cache_enabled: process.env.AI_CACHE_ENABLED === 'true',
    model: process.env.ZHIPU_AI_MODEL || 'glm-4'
  });
});

// 默认路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}，可通过网络访问`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('服务器正在关闭...');
  process.exit(0);
});