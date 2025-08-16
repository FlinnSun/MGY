import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Spin,
  Alert,
  Tag,
  Divider,
  Tooltip,
  FloatButton
} from 'antd';
import {
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

function AIAssistant({ visible, onClose, userId = 'default-user' }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [dailyTips, setDailyTips] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (visible) {
      checkAIStatus();
      loadDailyTips();
      // 添加欢迎消息
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          type: 'ai',
          content: '你好！我是你的AI助手，专门帮助ADHD用户提高学习和生活效率。你可以问我关于任务管理、情绪调节、学习方法等任何问题。',
          timestamp: new Date()
        }]);
      }
    }
  }, [visible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAIStatus = async () => {
    try {
      const response = await axios.get('/api/ai/status');
      setAiStatus(response.data);
    } catch (error) {
      console.error('检查AI状态失败:', error);
      setAiStatus({ ai_enabled: false, api_configured: false });
    }
  };

  const loadDailyTips = async () => {
    try {
      const response = await axios.get(`/api/ai/daily-tips/${userId}`);
      if (response.data.success) {
        setDailyTips(response.data.data || response.data.fallback);
      }
    } catch (error) {
      console.error('获取每日建议失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/question', {
        user_id: userId,
        question: inputValue,
        context: messages.slice(-5).map(m => `${m.type}: ${m.content}`).join('\n')
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.content || response.data.error || '抱歉，我现在无法回答您的问题。',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '抱歉，我现在无法回答您的问题。请检查网络连接或稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: '对话已清空。有什么我可以帮助您的吗？',
      timestamp: new Date()
    }]);
  };

  const quickQuestions = [
    '如何提高注意力？',
    '怎样管理时间？',
    '如何缓解焦虑？',
    '学习方法推荐',
    '如何建立好习惯？'
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  if (!visible) return null;

  return (
    <div className="ai-assistant-panel" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '-2px 0 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
    }}>
      {/* 头部 */}
      <div className="ai-assistant-header" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Avatar icon={<RobotOutlined />} style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white'
            }} />
            <div>
              <Text strong style={{ color: 'white' }}>AI助手</Text>
              <br />
              <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                {aiStatus?.ai_enabled && aiStatus?.api_configured ? (
                  <Tag color="green" size="small">在线</Tag>
                ) : (
                  <Tag color="orange" size="small">离线模式</Tag>
                )}
              </Text>
            </div>
          </Space>
          <Space>
            <Tooltip title="清空对话">
              <Button icon={<ReloadOutlined />} size="small" onClick={clearMessages} />
            </Tooltip>
            <Tooltip title="关闭">
              <Button icon={<CloseOutlined />} size="small" onClick={onClose} />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* AI状态提示 */}
      {aiStatus && !aiStatus.ai_enabled && (
        <Alert
          message="AI功能未启用"
          description="请联系管理员配置AI功能"
          type="warning"
          showIcon
          style={{ margin: '8px' }}
        />
      )}

      {aiStatus && aiStatus.ai_enabled && !aiStatus.api_configured && (
        <Alert
          message="AI API未配置"
          description="请在.env文件中配置智谱AI API密钥"
          type="warning"
          showIcon
          style={{ margin: '8px' }}
        />
      )}

      {/* 每日建议 */}
      {dailyTips && dailyTips.tips && (
        <Card
          size="small"
          title={<><BulbOutlined /> 今日建议</>}
          style={{ margin: '8px' }}
        >
          <List
            size="small"
            dataSource={dailyTips.tips.slice(0, 2)}
            renderItem={(tip) => (
              <List.Item>
                <div>
                  <Text strong>{tip.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {tip.description}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 消息列表 */}
      <div className="ai-chat-container" style={{
        flex: 1,
        padding: '8px',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)'
      }}>
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item className={`message-item fade-in ${message.type === 'user' ? 'user-message' : 'ai-message'}`} style={{ 
              border: 'none', 
              padding: '8px 0',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div className={`message-bubble ${message.type === 'user' ? 'user-bubble' : 'ai-bubble'}`} style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                    : 'rgba(255, 248, 240, 0.95)',
                  color: message.type === 'user' ? '#fff' : '#333',
                  boxShadow: message.type === 'user' 
                    ? '0 6px 18px rgba(255, 154, 158, 0.3)'
                    : '0 4px 12px rgba(252, 182, 159, 0.15)',
                  border: message.type === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.3s ease'
                }}>
                  <Paragraph
                    style={{
                      margin: 0,
                      color: message.type === 'user' ? '#fff' : '#000',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}
                  >
                    {message.content}
                  </Paragraph>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '10px',
                      opacity: 0.7,
                      color: message.type === 'user' ? '#fff' : '#999'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        {loading && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Spin size="small" />
            <Text type="secondary" style={{ marginLeft: '8px' }}>AI正在思考...</Text>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题 */}
      <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>快捷问题：</Text>
        <div style={{ marginTop: '4px' }}>
          {quickQuestions.map((question, index) => (
            <Tag
              key={index}
              style={{ margin: '2px', cursor: 'pointer' }}
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </Tag>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="ai-input-area" style={{
        padding: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)'
      }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            disabled={!inputValue.trim()}
          />
        </Space.Compact>
      </div>
    </div>
  );
}

export default AIAssistant;