const zhipuAI = require('./zhipuAI');
const fs = require('fs-extra');
const path = require('path');

class AIService {
  constructor() {
    this.cacheEnabled = process.env.AI_CACHE_ENABLED === 'true';
    this.cacheDir = path.join(__dirname, '../cache');
    this.initializeCache();
  }

  async initializeCache() {
    if (this.cacheEnabled) {
      await fs.ensureDir(this.cacheDir);
    }
  }

  // 检查AI服务是否已配置
  isConfigured() {
    return zhipuAI.isConfigured();
  }

  // 更新AI配置
  updateConfig(config) {
    return zhipuAI.updateConfig(config);
  }

  // 测试AI连接
  async testConnection() {
    try {
      const result = await zhipuAI.chat('你好，请回复一个简短的测试消息。', { max_tokens: 50 });
      return {
        success: true,
        message: '连接测试成功',
        response: result.content
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 生成缓存键
  generateCacheKey(type, data) {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify({ type, data }))
      .digest('hex');
    return `${type}_${hash}.json`;
  }

  // 从缓存读取
  async getFromCache(cacheKey) {
    if (!this.cacheEnabled) return null;
    
    try {
      const cachePath = path.join(this.cacheDir, cacheKey);
      if (await fs.pathExists(cachePath)) {
        const cached = await fs.readJson(cachePath);
        const now = Date.now();
        
        // 检查缓存是否过期（24小时）
        if (now - cached.timestamp < 24 * 60 * 60 * 1000) {
          return cached.data;
        } else {
          // 删除过期缓存
          await fs.remove(cachePath);
        }
      }
    } catch (error) {
      console.warn('缓存读取失败:', error.message);
    }
    
    return null;
  }

  // 写入缓存
  async saveToCache(cacheKey, data) {
    if (!this.cacheEnabled) return;
    
    try {
      const cachePath = path.join(this.cacheDir, cacheKey);
      await fs.writeJson(cachePath, {
        timestamp: Date.now(),
        data: data
      });
    } catch (error) {
      console.warn('缓存写入失败:', error.message);
    }
  }

  // 智能任务分解
  async analyzeAndDecomposeTask(task) {
    try {
      const cacheKey = this.generateCacheKey('task_decompose', task);
      let result = await this.getFromCache(cacheKey);
      
      if (!result) {
        result = await zhipuAI.decomposeTask(task);
        if (result.success) {
          await this.saveToCache(cacheKey, result);
        }
      }
      
      return result;
    } catch (error) {
      console.error('任务分解失败:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackTaskDecomposition(task)
      };
    }
  }

  // 情绪分析与建议
  async analyzeMoodWithContext(moodData, userId) {
    try {
      // 获取用户上下文数据
      const contextData = await this.getUserContext(userId);
      
      const result = await zhipuAI.analyzeMoodAndSuggest(moodData, contextData);
      
      if (result.success) {
        // 记录分析结果用于学习用户模式
        await this.recordMoodAnalysis(userId, moodData, result.data);
      }
      
      return result;
    } catch (error) {
      console.error('情绪分析失败:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackMoodSuggestions(moodData)
      };
    }
  }

  // 睡眠分析与建议
  async analyzeSleepWithContext(sleepData, userId) {
    try {
      const contextData = await this.getUserContext(userId);
      
      const result = await zhipuAI.analyzeSleepAndSuggest(sleepData, contextData);
      
      if (result.success) {
        await this.recordSleepAnalysis(userId, sleepData, result.data);
      }
      
      return result;
    } catch (error) {
      console.error('睡眠分析失败:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackSleepSuggestions(sleepData)
      };
    }
  }

  // 生成个性化阅读内容
  async generatePersonalizedReading(topic, userId, difficulty = 3) {
    try {
      const userProfile = await this.getUserProfile(userId);
      
      const cacheKey = this.generateCacheKey('reading_content', { topic, difficulty, userProfile });
      let result = await this.getFromCache(cacheKey);
      
      if (!result) {
        result = await zhipuAI.generateReadingContent(topic, difficulty, userProfile);
        if (result.success) {
          await this.saveToCache(cacheKey, result);
        }
      }
      
      return result;
    } catch (error) {
      console.error('阅读内容生成失败:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackReadingContent(topic, difficulty)
      };
    }
  }

  // 智能问答
  async handleQuestion(question, userId, context = '') {
    try {
      const userProfile = await this.getUserProfile(userId);
      const enhancedContext = `${context}\n用户特征: ${JSON.stringify(userProfile)}`;
      
      const result = await zhipuAI.answerQuestion(question, enhancedContext);
      
      // 记录问答历史
      await this.recordQuestionAnswer(userId, question, result.content);
      
      return result;
    } catch (error) {
      console.error('智能问答失败:', error.message);
      return {
        success: false,
        error: error.message,
        content: '抱歉，我现在无法回答您的问题。请稍后再试，或者联系客服获取帮助。'
      };
    }
  }

  // 生成每日个性化建议
  async generateDailyTips(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const recentData = await this.getRecentUserData(userId);
      
      // 根据最近的数据确定建议类别
      const category = this.determineTipCategory(recentData);
      
      const cacheKey = this.generateCacheKey('daily_tips', { userId, date: new Date().toDateString() });
      let result = await this.getFromCache(cacheKey);
      
      if (!result) {
        result = await zhipuAI.generatePersonalizedTips(userProfile, category);
        if (result.success) {
          await this.saveToCache(cacheKey, result);
        }
      }
      
      return result;
    } catch (error) {
      console.error('每日建议生成失败:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackDailyTips()
      };
    }
  }

  // 预测用户行为模式
  async predictUserPattern(userId, type) {
    try {
      const historicalData = await this.getHistoricalData(userId, type);
      
      if (historicalData.length < 7) {
        return {
          success: false,
          message: '数据不足，需要更多历史记录进行预测'
        };
      }
      
      // 使用AI分析历史模式
      const prompt = `
分析以下ADHD用户的${type}历史数据，预测未来趋势：

历史数据：${JSON.stringify(historicalData)}

请提供JSON格式的预测结果：
{
  "pattern_analysis": "模式分析",
  "predictions": [
    {
      "timeframe": "short_term|medium_term|long_term",
      "prediction": "预测内容",
      "confidence": "high|medium|low",
      "recommendations": ["建议"]
    }
  ],
  "risk_factors": ["风险因素"],
  "improvement_opportunities": ["改善机会"]
}
      `;
      
      const result = await zhipuAI.chat(prompt, { temperature: 0.6 });
      
      return {
        success: true,
        data: JSON.parse(result.content)
      };
    } catch (error) {
      console.error('模式预测失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取用户上下文数据
  async getUserContext(userId) {
    try {
      const [tasks, moods, sleep] = await Promise.all([
        this.getRecentTasks(userId),
        this.getRecentMoods(userId),
        this.getRecentSleep(userId)
      ]);
      
      return {
        taskCompletion: this.calculateTaskCompletion(tasks),
        moodAverage: this.calculateMoodAverage(moods),
        sleepQuality: this.calculateSleepQuality(sleep),
        taskPressure: this.calculateTaskPressure(tasks)
      };
    } catch (error) {
      console.error('获取用户上下文失败:', error.message);
      return {};
    }
  }

  // 获取用户画像
  async getUserProfile(userId) {
    try {
      // 这里应该从数据库获取用户画像
      // 暂时返回默认画像
      return {
        adhd_type: 'mixed',
        attention_span: 'short',
        learning_style: 'visual',
        motivation_factors: ['achievement', 'social'],
        difficulty_areas: ['time_management', 'organization']
      };
    } catch (error) {
      console.error('获取用户画像失败:', error.message);
      return {};
    }
  }

  // 辅助方法：计算任务完成率
  calculateTaskCompletion(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  // 辅助方法：计算情绪平均值
  calculateMoodAverage(moods) {
    if (!moods || moods.length === 0) return 0;
    const sum = moods.reduce((acc, mood) => acc + mood.mood_score, 0);
    return Math.round((sum / moods.length) * 10) / 10;
  }

  // 辅助方法：计算睡眠质量
  calculateSleepQuality(sleepRecords) {
    if (!sleepRecords || sleepRecords.length === 0) return 0;
    const sum = sleepRecords.reduce((acc, sleep) => acc + sleep.quality_score, 0);
    return Math.round((sum / sleepRecords.length) * 10) / 10;
  }

  // 辅助方法：计算任务压力
  calculateTaskPressure(tasks) {
    if (!tasks || tasks.length === 0) return 'low';
    const overdueTasks = tasks.filter(task => 
      !task.completed && task.due_date && new Date(task.due_date) < new Date()
    ).length;
    const urgentTasks = tasks.filter(task => 
      !task.completed && task.priority >= 3
    ).length;
    
    if (overdueTasks > 2 || urgentTasks > 3) return 'high';
    if (overdueTasks > 0 || urgentTasks > 1) return 'medium';
    return 'low';
  }

  // 降级方案：基础任务分解
  getFallbackTaskDecomposition(task) {
    return {
      analysis: '由于AI服务暂时不可用，这里提供基础的任务分解建议。',
      steps: [
        {
          title: '准备阶段',
          description: '收集完成任务所需的材料和信息',
          estimated_time: '10-15分钟',
          tips: '确保工作环境整洁，减少干扰'
        },
        {
          title: '执行阶段',
          description: '按计划执行主要任务内容',
          estimated_time: '根据任务复杂度而定',
          tips: '设置定时器，每25分钟休息5分钟'
        },
        {
          title: '检查阶段',
          description: '检查任务完成质量，进行必要调整',
          estimated_time: '5-10分钟',
          tips: '仔细检查，确保达到预期标准'
        }
      ],
      attention_traps: ['手机通知', '网页浏览', '完美主义倾向'],
      motivation_tips: ['设置小奖励', '寻找学习伙伴', '记录进步']
    };
  }

  // 降级方案：基础情绪建议
  getFallbackMoodSuggestions(moodData) {
    const score = moodData.mood_score;
    let suggestions = [];
    
    if (score <= 2) {
      suggestions = [
        { type: 'immediate', title: '深呼吸练习', description: '进行5分钟深呼吸，帮助放松' },
        { type: 'short_term', title: '轻度运动', description: '散步或做简单拉伸运动' },
        { type: 'long_term', title: '寻求支持', description: '与朋友或家人交流，分享感受' }
      ];
    } else if (score >= 4) {
      suggestions = [
        { type: 'immediate', title: '记录成就', description: '写下今天的积极体验' },
        { type: 'short_term', title: '分享快乐', description: '与他人分享你的好心情' },
        { type: 'long_term', title: '保持习惯', description: '继续保持良好的生活习惯' }
      ];
    } else {
      suggestions = [
        { type: 'immediate', title: '正念练习', description: '专注当下，观察周围环境' },
        { type: 'short_term', title: '调整计划', description: '适当调整今日计划，减少压力' },
        { type: 'long_term', title: '规律作息', description: '保持规律的睡眠和饮食' }
      ];
    }
    
    return {
      mood_analysis: `根据您的情绪评分${score}，建议关注情绪调节。`,
      suggestions: suggestions,
      prevention_tips: ['保持规律作息', '适度运动', '社交互动'],
      encouragement: '每一天都是新的开始，相信自己能够处理好各种情况！'
    };
  }

  // 降级方案：基础睡眠建议
  getFallbackSleepSuggestions(sleepData) {
    return {
      sleep_analysis: '基于您的睡眠记录，建议关注睡眠质量改善。',
      improvement_suggestions: [
        {
          category: 'sleep_hygiene',
          title: '睡前准备',
          description: '睡前1小时避免使用电子设备',
          priority: 'high'
        },
        {
          category: 'environment',
          title: '睡眠环境',
          description: '保持卧室安静、黑暗、凉爽',
          priority: 'medium'
        }
      ],
      sleep_schedule_tips: '尽量保持固定的睡眠时间',
      next_day_preparation: '为明天准备好衣物和必需品'
    };
  }

  // 降级方案：基础阅读内容
  getFallbackReadingContent(topic, difficulty) {
    return {
      title: `关于${topic}的基础介绍`,
      content: `这是一篇关于${topic}的基础介绍文章。由于AI服务暂时不可用，我们为您提供这个简化版本。建议您稍后再试，或者浏览我们的其他内容。`,
      key_points: ['基础概念', '重要特征', '实际应用'],
      discussion_questions: [`什么是${topic}？`, `${topic}有什么重要性？`],
      difficulty_level: difficulty,
      estimated_reading_time: '3-5分钟'
    };
  }

  // 降级方案：基础每日建议
  getFallbackDailyTips() {
    const tips = [
      {
        title: '番茄工作法',
        description: '使用25分钟专注+5分钟休息的循环',
        difficulty: 'easy',
        expected_benefit: '提高专注力和效率'
      },
      {
        title: '任务清单',
        description: '每天制作简单的任务清单，完成后打勾',
        difficulty: 'easy',
        expected_benefit: '增强成就感和条理性'
      },
      {
        title: '定时休息',
        description: '每小时起身活动5分钟',
        difficulty: 'easy',
        expected_benefit: '保持精力和注意力'
      }
    ];
    
    return { tips };
  }

  // 数据获取方法（需要根据实际数据存储实现）
  async getRecentTasks(userId) {
    // 实现获取最近任务的逻辑
    return [];
  }

  async getRecentMoods(userId) {
    // 实现获取最近情绪记录的逻辑
    return [];
  }

  async getRecentSleep(userId) {
    // 实现获取最近睡眠记录的逻辑
    return [];
  }

  async getRecentUserData(userId) {
    // 实现获取用户最近数据的逻辑
    return {};
  }

  async getHistoricalData(userId, type) {
    // 实现获取历史数据的逻辑
    return [];
  }

  // 记录方法
  async recordMoodAnalysis(userId, moodData, analysis) {
    // 实现记录情绪分析结果的逻辑
  }

  async recordSleepAnalysis(userId, sleepData, analysis) {
    // 实现记录睡眠分析结果的逻辑
  }

  async recordQuestionAnswer(userId, question, answer) {
    // 实现记录问答历史的逻辑
  }

  // 确定建议类别
  determineTipCategory(recentData) {
    // 根据最近数据确定需要什么类型的建议
    return 'general';
  }
}

// 创建单例实例
const aiService = new AIService();

module.exports = aiService;