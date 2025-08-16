import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Rate, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Typography,
  Space,
  message,
  Timeline,
  Tag,
  Statistic,
  Progress,
  Alert,
  Modal,
  Form,
  Divider,
  Tooltip,
  Avatar,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  SunOutlined,
  CloudOutlined,
  LineChartOutlined,
  RiseOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import dayjs from 'dayjs';
import axios from 'axios';
import SmartMoodAnalyzer from '../components/SmartMoodAnalyzer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function MoodPage() {
  const [moodRecords, setMoodRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMood, setCurrentMood] = useState(3);
  const [moodNote, setMoodNote] = useState('');
  const [moodTrigger, setMoodTrigger] = useState('');
  const [moodStats, setMoodStats] = useState({
    averageMood: 0,
    totalRecords: 0,
    weeklyTrend: 0,
    mostFrequentMood: '',
    streakDays: 0
  });

  useEffect(() => {
    loadMoodRecords();
  }, []);

  useEffect(() => {
    calculateMoodStats();
  }, [moodRecords]);

  const calculateMoodStats = () => {
    if (moodRecords.length === 0) {
      setMoodStats({
        averageMood: 0,
        totalRecords: 0,
        weeklyTrend: 0,
        mostFrequentMood: '',
        streakDays: 0
      });
      return;
    }

    const totalRecords = moodRecords.length;
    const averageMood = moodRecords.reduce((sum, record) => sum + record.mood_score, 0) / totalRecords;
    
    // 计算最近7天的趋势
    const recentRecords = moodRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let weeklyTrend = 0;
    if (recentRecords.length >= 2) {
      const firstHalf = recentRecords.slice(0, Math.ceil(recentRecords.length / 2));
      const secondHalf = recentRecords.slice(Math.ceil(recentRecords.length / 2));
      const firstAvg = firstHalf.reduce((sum, r) => sum + r.mood_score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.mood_score, 0) / secondHalf.length;
      weeklyTrend = ((secondAvg - firstAvg) / firstAvg) * 100;
    }

    // 找出最常见的情绪
    const moodCounts = {};
    moodRecords.forEach(record => {
      const moodText = getMoodText(record.mood_score);
      moodCounts[moodText] = (moodCounts[moodText] || 0) + 1;
    });
    const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, '');

    // 计算连续记录天数
    const sortedRecords = [...moodRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      
      if (recordDate.getTime() === currentDate.getTime()) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    setMoodStats({
      averageMood: Math.round(averageMood * 10) / 10,
      totalRecords,
      weeklyTrend: Math.round(weeklyTrend * 10) / 10,
      mostFrequentMood,
      streakDays
    });
  };

  const loadMoodRecords = async () => {
    try {
      setLoading(true);
      // 模拟数据
      const mockRecords = [
        {
          id: '1',
          mood_score: 4,
          notes: '今天完成了阅读任务，感觉很有成就感',
          trigger: 'achievement',
          date: dayjs().format('YYYY-MM-DD'),
          created_at: dayjs().subtract(2, 'hour').toISOString()
        },
        {
          id: '2',
          mood_score: 3,
          notes: '有点累，但是心情还可以',
          trigger: 'tired',
          date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
          created_at: dayjs().subtract(1, 'day').toISOString()
        },
        {
          id: '3',
          mood_score: 5,
          notes: '和朋友一起学习，很开心',
          trigger: 'social',
          date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
          created_at: dayjs().subtract(2, 'day').toISOString()
        },
        {
          id: '4',
          mood_score: 2,
          notes: '作业有点难，感到沮丧',
          trigger: 'difficulty',
          date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
          created_at: dayjs().subtract(3, 'day').toISOString()
        },
        {
          id: '5',
          mood_score: 4,
          notes: '使用了阅读助手，理解效果很好',
          trigger: 'tool_help',
          date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
          created_at: dayjs().subtract(4, 'day').toISOString()
        },
        {
          id: '6',
          mood_score: 3,
          notes: '普通的一天',
          trigger: 'normal',
          date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
          created_at: dayjs().subtract(5, 'day').toISOString()
        },
        {
          id: '7',
          mood_score: 5,
          notes: '今天睡眠质量很好，精神状态佳',
          trigger: 'good_sleep',
          date: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
          created_at: dayjs().subtract(6, 'day').toISOString()
        }
      ];
      setMoodRecords(mockRecords);
    } catch (error) {
      message.error('加载情绪记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!moodNote.trim()) {
      message.warning('请添加一些情绪描述');
      return;
    }

    try {
      const newRecord = {
        id: Date.now().toString(),
        mood_score: currentMood,
        notes: moodNote,
        trigger: moodTrigger,
        date: selectedDate.format('YYYY-MM-DD'),
        created_at: new Date().toISOString()
      };

      setMoodRecords(prev => [newRecord, ...prev]);
      message.success('情绪记录保存成功');
      
      // 重置表单
      setCurrentMood(3);
      setMoodNote('');
      setMoodTrigger('');
      setSelectedDate(dayjs());
      
    } catch (error) {
      message.error('保存失败');
    }
  };

  const getMoodIcon = (score) => {
    if (score >= 5) return <SmileOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
    if (score >= 4) return <SmileOutlined style={{ color: '#73d13d', fontSize: 20 }} />;
    if (score >= 3) return <MehOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (score >= 2) return <FrownOutlined style={{ color: '#ff7875', fontSize: 20 }} />;
    return <FrownOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
  };

  const getMoodText = (score) => {
    if (score === 5) return '非常开心';
    if (score === 4) return '开心';
    if (score === 3) return '一般';
    if (score === 2) return '不开心';
    if (score === 1) return '很难过';
    return '未知';
  };

  const getMoodColor = (score) => {
    if (score >= 5) return '#52c41a';
    if (score >= 4) return '#73d13d';
    if (score >= 3) return '#faad14';
    if (score >= 2) return '#ff7875';
    return '#ff4d4f';
  };

  const getTriggerText = (trigger) => {
    const triggers = {
      achievement: '成就感',
      tired: '疲劳',
      social: '社交',
      difficulty: '困难',
      tool_help: '工具帮助',
      normal: '日常',
      good_sleep: '良好睡眠',
      stress: '压力',
      exercise: '运动',
      family: '家庭'
    };
    return triggers[trigger] || trigger;
  };

  const getTriggerColor = (trigger) => {
    const colors = {
      achievement: 'green',
      tired: 'orange',
      social: 'blue',
      difficulty: 'red',
      tool_help: 'purple',
      normal: 'default',
      good_sleep: 'cyan',
      stress: 'volcano',
      exercise: 'lime',
      family: 'pink'
    };
    return colors[trigger] || 'default';
  };

  // 计算统计数据
  const getStats = () => {
    if (moodRecords.length === 0) return { average: 0, trend: 0, goodDays: 0 };
    
    const recent7Days = moodRecords.slice(0, 7);
    const average = recent7Days.reduce((sum, record) => sum + record.mood_score, 0) / recent7Days.length;
    
    const goodDays = recent7Days.filter(record => record.mood_score >= 4).length;
    
    // 计算趋势（最近3天 vs 前3天）
    const recent3 = recent7Days.slice(0, 3);
    const previous3 = recent7Days.slice(3, 6);
    const recentAvg = recent3.length > 0 ? recent3.reduce((sum, r) => sum + r.mood_score, 0) / recent3.length : 0;
    const prevAvg = previous3.length > 0 ? previous3.reduce((sum, r) => sum + r.mood_score, 0) / previous3.length : 0;
    const trend = recentAvg - prevAvg;
    
    return { average: average.toFixed(1), trend: trend.toFixed(1), goodDays };
  };

  const stats = getStats();

  // 准备图表数据
  const chartData = moodRecords
    .slice(0, 14)
    .reverse()
    .map(record => ({
      date: dayjs(record.date).format('MM/DD'),
      mood: record.mood_score,
      fullDate: record.date
    }));

  const encouragementMessages = {
    5: '太棒了！保持这种积极的心态！',
    4: '很好！你今天的状态不错！',
    3: '还不错，记得关注自己的感受。',
    2: '今天可能有些困难，但明天会更好。',
    1: '今天很辛苦，记得好好休息和照顾自己。'
  };

  const moodTips = {
    5: ['继续保持积极心态', '分享你的快乐给朋友', '记录下让你开心的事情'],
    4: ['保持良好的作息', '适当运动放松', '与朋友交流'],
    3: ['尝试深呼吸放松', '听听轻音乐', '做一些喜欢的事情'],
    2: ['寻求朋友或家人的支持', '尝试简单的放松活动', '不要给自己太大压力'],
    1: ['考虑寻求专业帮助', '确保充足的休息', '与信任的人交谈']
  };

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <HeartOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
          情绪记录
        </Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="总记录数"
              value={moodStats.totalRecords}
              prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="平均心情"
              value={moodStats.averageMood}
              suffix="/ 5"
              valueStyle={{ color: getMoodColor(moodStats.averageMood) }}
              prefix={getMoodIcon(moodStats.averageMood)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="连续记录"
              value={moodStats.streakDays}
              suffix="天"
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="周趋势"
              value={Math.abs(moodStats.weeklyTrend)}
              suffix="%"
              valueStyle={{ color: moodStats.weeklyTrend >= 0 ? '#3f8600' : '#f5222d' }}
              prefix={<RiseOutlined style={{ 
                color: moodStats.weeklyTrend >= 0 ? '#3f8600' : '#f5222d',
                transform: moodStats.weeklyTrend < 0 ? 'rotate(180deg)' : 'none'
              }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card title={<><LineChartOutlined /> 情绪分析</>} hoverable>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <Avatar 
                  size={64} 
                  style={{ 
                    backgroundColor: getMoodColor(moodStats.averageMood),
                    fontSize: '24px'
                  }}
                >
                  {getMoodIcon(moodStats.averageMood)}
                </Avatar>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 8 }}>
                最常见情绪: {moodStats.mostFrequentMood}
              </div>
              <Progress
                percent={moodStats.averageMood * 20}
                strokeColor={{
                  '0%': '#f5222d',
                  '50%': '#faad14',
                  '100%': '#52c41a',
                }}
                format={() => `${moodStats.averageMood}/5`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<><ThunderboltOutlined /> 情绪提升建议</>} hoverable>
            <div style={{ padding: '20px 0' }}>
              {moodStats.averageMood >= 4 ? (
                <div>
                  <div style={{ fontSize: '16px', color: '#52c41a', marginBottom: 8 }}>🎉 情绪状态很棒！</div>
                  <div>继续保持积极的生活态度，可以尝试：</div>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>分享快乐给身边的人</li>
                    <li>记录美好时刻</li>
                    <li>尝试新的兴趣爱好</li>
                  </ul>
                </div>
              ) : moodStats.averageMood >= 3 ? (
                <div>
                  <div style={{ fontSize: '16px', color: '#faad14', marginBottom: 8 }}>😊 情绪还不错</div>
                  <div>可以通过以下方式提升心情：</div>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>适量运动</li>
                    <li>听喜欢的音乐</li>
                    <li>与朋友聊天</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '16px', color: '#f5222d', marginBottom: 8 }}>🤗 需要关注情绪健康</div>
                  <div>建议尝试：</div>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>深呼吸和冥想</li>
                    <li>寻求专业帮助</li>
                    <li>规律作息</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 今日情绪记录 */}
        <Col xs={24} lg={12}>
          <Card title={<><PlusOutlined /> 记录今日情绪</>} style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ textAlign: 'center' }}>
                <Title level={4}>今天的心情如何？</Title>
                <div style={{ fontSize: 48, marginBottom: 16 }}>
                  {getMoodIcon(currentMood)}
                </div>
                <Rate 
                  value={currentMood} 
                  onChange={setCurrentMood}
                  character={<HeartOutlined />}
                  style={{ fontSize: 24 }}
                />
                <div style={{ marginTop: 8, fontSize: 16, fontWeight: 'bold', color: getMoodColor(currentMood) }}>
                  {getMoodText(currentMood)}
                </div>
              </div>
              
              <div>
                <Text strong>情绪触发因素：</Text>
                <Select
                  value={moodTrigger}
                  onChange={setMoodTrigger}
                  placeholder="选择影响情绪的因素"
                  style={{ width: '100%', marginTop: 8 }}
                  allowClear
                >
                  <Option value="achievement">成就感</Option>
                  <Option value="social">社交活动</Option>
                  <Option value="difficulty">学习困难</Option>
                  <Option value="tired">疲劳</Option>
                  <Option value="stress">压力</Option>
                  <Option value="tool_help">工具帮助</Option>
                  <Option value="exercise">运动</Option>
                  <Option value="family">家庭</Option>
                  <Option value="good_sleep">良好睡眠</Option>
                  <Option value="normal">日常生活</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>详细描述：</Text>
                <TextArea
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="描述一下今天的感受和发生的事情..."
                  rows={4}
                  style={{ marginTop: 8 }}
                />
              </div>
              
              <div>
                <Text strong>日期：</Text>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>
              
              <Button 
                type="primary" 
                block 
                size="large"
                onClick={handleSubmit}
                disabled={!moodNote.trim()}
              >
                保存情绪记录
              </Button>
            </Space>
          </Card>
        </Col>
        
        {/* 情绪统计 */}
        <Col xs={24} lg={12}>
          <Card title={<><LineChartOutlined /> 情绪统计</>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="7天平均"
                  value={stats.average}
                  suffix="/ 5"
                  valueStyle={{ color: getMoodColor(parseFloat(stats.average)) }}
                  prefix={getMoodIcon(parseFloat(stats.average))}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="好心情天数"
                  value={stats.goodDays}
                  suffix="/ 7天"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="情绪趋势"
                  value={stats.trend}
                  valueStyle={{ color: parseFloat(stats.trend) >= 0 ? '#52c41a' : '#ff4d4f' }}
                  prefix={parseFloat(stats.trend) >= 0 ? <ThunderboltOutlined /> : <CloudOutlined />}
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: 24 }}>
              <Text strong>情绪趋势图（最近14天）</Text>
              <div style={{ height: 200, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} />
                    <RechartsTooltip 
                      formatter={(value) => [getMoodText(value), '心情指数']}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#eb2f96" 
                      fill="#eb2f96" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="overview" style={{ marginTop: 16 }}>
        <TabPane tab="情绪概览" key="overview">
          <Row gutter={[16, 16]}>
            {/* 情绪建议 */}
            <Col xs={24} lg={8}>
              <Card title={<><SunOutlined /> 情绪建议</>}>
                {currentMood > 0 && (
                  <div>
                    <Alert
                      message={encouragementMessages[currentMood]}
                      type={currentMood >= 4 ? 'success' : currentMood >= 3 ? 'info' : 'warning'}
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    
                    <Title level={5}>建议活动：</Title>
                    <ul>
                      {moodTips[currentMood]?.map((tip, index) => (
                        <li key={index} style={{ marginBottom: 8 }}>
                          <Text>{tip}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </Col>
            
            {/* 历史记录 */}
            <Col xs={24} lg={16}>
              <Card title="历史记录">
                <Timeline
                  items={moodRecords.slice(0, 10).map((record, index) => ({
                    key: record.id,
                    dot: getMoodIcon(record.mood_score),
                    children: (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Text strong style={{ marginRight: 8 }}>
                            {dayjs(record.date).format('MM月DD日')}
                          </Text>
                          <Tag color={getTriggerColor(record.trigger)} size="small">
                            {getTriggerText(record.trigger)}
                          </Tag>
                          <Text 
                            style={{ 
                              marginLeft: 8, 
                              color: getMoodColor(record.mood_score),
                              fontWeight: 'bold'
                            }}
                          >
                            {getMoodText(record.mood_score)}
                          </Text>
                        </div>
                        <Paragraph style={{ margin: 0, color: '#666' }}>
                          {record.notes}
                        </Paragraph>
                      </div>
                    )
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab={<><BulbOutlined /> AI智能分析</>} key="ai-analysis">
          <SmartMoodAnalyzer 
            moodRecords={moodRecords}
            userId="default-user"
            onRefresh={loadMoodRecords}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default MoodPage;