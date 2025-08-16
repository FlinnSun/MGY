const axios = require('axios');
require('dotenv').config();

class ZhipuAIClient {
  constructor() {
    this.apiKey = process.env.ZHIPU_AI_API_KEY;
    this.baseURL = process.env.ZHIPU_AI_BASE_URL;
    this.model = process.env.ZHIPU_AI_MODEL || 'glm-4';
    this.rateLimit = parseInt(process.env.AI_RATE_LIMIT) || 100;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.warn('警告: 智谱AI API密钥未配置，AI功能将不可用');
    }
  }

  // 检查API密钥是否配置
  isConfigured() {
    return this.apiKey && this.apiKey !== 'your_api_key_here';
  }

  // 更新配置
  updateConfig(config) {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    if (config.model) {
      this.model = config.model;
    }
    if (config.baseUrl) {
      this.baseURL = config.baseUrl;
    }
    console.log('智谱AI配置已更新');
  }

  // 检查速率限制
  checkRateLimit() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (now - this.lastResetTime > oneHour) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.rateLimit) {
      throw new Error('API调用频率超限，请稍后再试');
    }
    
    this.requestCount++;
  }

  // 基础聊天接口
  async chat(prompt, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('智谱AI API未配置');
    }

    this.checkRateLimit();

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的ADHD辅助专家，专门帮助ADHD用户提高学习和生活效率。请用简洁、友好、积极的语调回答问题。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
          top_p: options.top_p || 0.9,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ADHD-Assistant/1.0'
          },
          timeout: 30000 // 30秒超时
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        return {
          success: true,
          content: response.data.choices[0].message.content,
          usage: response.data.usage
        };
      } else {
        throw new Error('API响应格式异常');
      }
    } catch (error) {
      console.error('智谱AI API调用失败:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.message;
        
        if (status === 401) {
          throw new Error('API密钥无效，请检查配置');
        } else if (status === 429) {
          throw new Error('API调用频率超限，请稍后再试');
        } else if (status >= 500) {
          throw new Error('AI服务暂时不可用，请稍后再试');
        } else {
          throw new Error(`API调用失败: ${message}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，请检查网络连接');
      } else {
        throw new Error(`网络错误: ${error.message}`);
      }
    }
  }

  // 任务分解
  async decomposeTask(task) {
    const prompt = `
作为ADHD辅助专家，请将以下任务分解为适合ADHD用户的小步骤：

任务标题：${task.title}
任务描述：${task.description || '无'}
优先级：${task.priority || 1}
截止时间：${task.due_date || '无'}

请提供JSON格式的回答，包含：
{
  "analysis": "任务分析",
  "steps": [
    {
      "title": "步骤标题",
      "description": "具体描述",
      "estimated_time": "预估时间（分钟）",
      "tips": "执行建议"
    }
  ],
  "attention_traps": ["可能的注意力陷阱"],
  "motivation_tips": ["激励建议"]
}
    `;

    try {
      const result = await this.chat(prompt, { temperature: 0.8 });
      return {
        success: true,
        data: JSON.parse(result.content)
      };
    } catch (error) {
      if (error.message.includes('JSON')) {
        // JSON解析失败，返回原始文本
        return {
          success: true,
          data: { analysis: result.content }
        };
      }
      throw error;
    }
  }

  // 情绪分析与建议
  async analyzeMoodAndSuggest(moodData, contextData = {}) {
    const prompt = `
基于以下数据为ADHD用户提供情绪调节建议：

当前情绪评分：${moodData.mood_score}/5
情绪描述：${moodData.notes || '无'}
记录时间：${moodData.date}
最近任务完成情况：${contextData.taskCompletion || '无数据'}
睡眠质量：${contextData.sleepQuality || '无数据'}

请提供JSON格式的回答：
{
  "mood_analysis": "情绪状态分析",
  "suggestions": [
    {
      "type": "immediate|short_term|long_term",
      "title": "建议标题",
      "description": "具体建议",
      "difficulty": "easy|medium|hard"
    }
  ],
  "prevention_tips": ["预防措施"],
  "encouragement": "鼓励话语"
}
    `;

    try {
      const result = await this.chat(prompt, { temperature: 0.7 });
      return {
        success: true,
        data: JSON.parse(result.content)
      };
    } catch (error) {
      if (error.message.includes('JSON')) {
        return {
          success: true,
          data: { mood_analysis: result.content }
        };
      }
      throw error;
    }
  }

  // 睡眠分析与建议
  async analyzeSleepAndSuggest(sleepData, contextData = {}) {
    const prompt = `
基于以下睡眠数据为ADHD用户提供改善建议：

睡眠质量评分：${sleepData.quality_score}/5
就寝时间：${sleepData.bedtime}
起床时间：${sleepData.wake_time}
睡眠备注：${sleepData.notes || '无'}
日期：${sleepData.date}
最近情绪状态：${contextData.moodAverage || '无数据'}
任务压力：${contextData.taskPressure || '无数据'}

请提供JSON格式的回答：
{
  "sleep_analysis": "睡眠质量分析",
  "improvement_suggestions": [
    {
      "category": "sleep_hygiene|environment|routine|stress",
      "title": "建议标题",
      "description": "具体建议",
      "priority": "high|medium|low"
    }
  ],
  "sleep_schedule_tips": "作息建议",
  "next_day_preparation": "明日准备建议"
}
    `;

    try {
      const result = await this.chat(prompt, { temperature: 0.6 });
      return {
        success: true,
        data: JSON.parse(result.content)
      };
    } catch (error) {
      if (error.message.includes('JSON')) {
        return {
          success: true,
          data: { sleep_analysis: result.content }
        };
      }
      throw error;
    }
  }

  // 阅读内容生成
  async generateReadingContent(topic, difficulty, userProfile = {}) {
    const prompt = `
为ADHD用户生成适合的阅读内容：

主题：${topic}
难度级别：${difficulty}/5
用户特征：${JSON.stringify(userProfile)}

请生成一篇适合ADHD用户的文章，要求：
1. 结构清晰，段落简短
2. 语言简洁明了
3. 包含有趣的事实或故事
4. 长度适中（300-500字）
5. 包含思考问题

请提供JSON格式：
{
  "title": "文章标题",
  "content": "文章内容",
  "key_points": ["关键要点"],
  "discussion_questions": ["讨论问题"],
  "difficulty_level": ${difficulty},
  "estimated_reading_time": "预估阅读时间（分钟）"
}
    `;

    try {
      const result = await this.chat(prompt, { temperature: 0.8, max_tokens: 1500 });
      return {
        success: true,
        data: JSON.parse(result.content)
      };
    } catch (error) {
      if (error.message.includes('JSON')) {
        return {
          success: true,
          data: { 
            title: topic,
            content: result.content,
            difficulty_level: difficulty
          }
        };
      }
      throw error;
    }
  }

  // 智能问答
  async answerQuestion(question, context = '') {
    const prompt = `
用户问题：${question}

${context ? `相关背景：${context}` : ''}

请作为ADHD辅助专家，用简洁、友好的方式回答用户的问题。如果问题与ADHD、学习、时间管理、情绪调节等相关，请提供专业建议。
    `;

    const result = await this.chat(prompt, { temperature: 0.7 });
    return result;
  }

  // 生成个性化建议
  async generatePersonalizedTips(userProfile, category) {
    const prompt = `
基于用户画像生成个性化建议：

用户特征：${JSON.stringify(userProfile)}
建议类别：${category}

请提供3-5个具体、可执行的建议，格式为JSON：
{
  "tips": [
    {
      "title": "建议标题",
      "description": "详细描述",
      "difficulty": "easy|medium|hard",
      "expected_benefit": "预期效果"
    }
  ]
}
    `;

    try {
      const result = await this.chat(prompt, { temperature: 0.8 });
      return {
        success: true,
        data: JSON.parse(result.content)
      };
    } catch (error) {
      if (error.message.includes('JSON')) {
        return {
          success: true,
          data: { tips: [{ title: '个性化建议', description: result.content }] }
        };
      }
      throw error;
    }
  }
}

// 创建单例实例
const zhipuAI = new ZhipuAIClient();

module.exports = zhipuAI;