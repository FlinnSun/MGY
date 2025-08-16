import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Alert,
  List,
  Progress,
  Divider,
  Button,
  Tooltip,
  Row,
  Col,
  Statistic,
  Timeline
} from 'antd';
import {
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  HeartOutlined,
  BulbOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;

function SmartMoodAnalyzer({ moodRecords, userId = 'default-user', onRefresh }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (moodRecords && moodRecords.length > 0) {
      analyzeMoodData();
    }
  }, [moodRecords]);

  const analyzeMoodData = async () => {
    if (!moodRecords || moodRecords.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // 获取最近的情绪记录进行分析
      const recentRecord = moodRecords[moodRecords.length - 1];
      
      const response = await axios.post('/api/ai/mood-analyze', {
        user_id: userId,
        mood_data: {
          current_mood: recentRecord.mood,
          energy_level: recentRecord.energy_level,
          stress_level: recentRecord.stress_level,
          notes: recentRecord.notes,
          timestamp: recentRecord.timestamp
        },
        historical_data: moodRecords.slice(-7) // 最近7天的数据
      });

      if (response.data.success) {
        setAnalysis(response.data.data || response.data.fallback);
      } else {
        setError(response.data.error || '分析失败');
      }
    } catch (error) {
      console.error('情绪分析失败:', error);
      // 提供降级分析
      setAnalysis(generateFallbackAnalysis());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackAnalysis = () => {
    if (!moodRecords || moodRecords.length === 0) return null;

    const recentMoods = moodRecords.slice(-7);
    const avgMood = recentMoods.reduce((sum, record) => sum + record.mood, 0) / recentMoods.length;
    const avgEnergy = recentMoods.reduce((sum, record) => sum + (record.energy_level || 5), 0) / recentMoods.length;
    const avgStress = recentMoods.reduce((sum, record) => sum + (record.stress_level || 5), 0) / recentMoods.length;

    return {
      overall_trend: avgMood >= 7 ? 'positive' : avgMood >= 4 ? 'stable' : 'concerning',
      mood_score: Math.round(avgMood * 10) / 10,
      energy_score: Math.round(avgEnergy * 10) / 10,
      stress_score: Math.round(avgStress * 10) / 10,
      insights: [
        avgMood >= 7 ? '您的整体情绪状态良好' : avgMood >= 4 ? '您的情绪状态相对稳定' : '建议关注情绪健康',
        avgEnergy >= 7 ? '精力充沛' : avgEnergy >= 4 ? '精力适中' : '可能需要更多休息',
        avgStress <= 3 ? '压力水平较低' : avgStress <= 6 ? '压力水平适中' : '压力较大，建议放松'
      ],
      suggestions: [
        {
          category: '情绪调节',
          title: '深呼吸练习',
          description: '每天进行5-10分钟的深呼吸练习，有助于缓解压力和焦虑。',
          priority: 'medium'
        },
        {
          category: '生活习惯',
          title: '规律作息',
          description: '保持规律的睡眠时间，有助于稳定情绪和提高精力。',
          priority: 'high'
        },
        {
          category: '社交活动',
          title: '与朋友交流',
          description: '定期与朋友或家人交流，分享感受，获得情感支持。',
          priority: 'medium'
        }
      ],
      patterns: [
        {
          type: '时间模式',
          description: '建议继续记录情绪以发现更多模式'
        }
      ]
    };
  };

  const getMoodIcon = (mood) => {
    if (mood >= 8) return <SmileOutlined style={{ color: '#52c41a' }} />;
    if (mood >= 6) return <SmileOutlined style={{ color: '#faad14' }} />;
    if (mood >= 4) return <MehOutlined style={{ color: '#faad14' }} />;
    return <FrownOutlined style={{ color: '#f5222d' }} />;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'positive': return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'concerning': return <FallOutlined style={{ color: '#f5222d' }} />;
      default: return <MehOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'positive': return '#52c41a';
      case 'concerning': return '#f5222d';
      default: return '#faad14';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  if (!moodRecords || moodRecords.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <HeartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <div>
            <Text type="secondary">暂无情绪数据</Text>
            <br />
            <Text type="secondary">记录几次情绪后，AI将为您提供智能分析</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* 整体分析概览 */}
      {analysis && (
        <Card
          title={
            <Space>
              <BulbOutlined style={{ color: '#1890ff' }} />
              <span className="gradient-text">🧠 AI情绪分析</span>
              <Tooltip title="重新分析">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={analyzeMoodData}
                  loading={loading}
                />
              </Tooltip>
            </Space>
          }
          className="hover-card"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="整体趋势"
                  value={analysis.overall_trend === 'positive' ? '积极' : 
                         analysis.overall_trend === 'stable' ? '稳定' : '需关注'}
                  prefix={getTrendIcon(analysis.overall_trend)}
                  valueStyle={{ color: getTrendColor(analysis.overall_trend) }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="情绪评分"
                  value={analysis.mood_score}
                  suffix="/ 10"
                  prefix={getMoodIcon(analysis.mood_score)}
                  valueStyle={{ color: analysis.mood_score >= 7 ? '#52c41a' : analysis.mood_score >= 4 ? '#faad14' : '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="精力水平"
                  value={analysis.energy_score}
                  suffix="/ 10"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: analysis.energy_score >= 7 ? '#52c41a' : analysis.energy_score >= 4 ? '#faad14' : '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 压力水平进度条 */}
          <div style={{ marginTop: 16 }}>
            <Text strong>压力水平：</Text>
            <Progress
              percent={(analysis.stress_score / 10) * 100}
              strokeColor={analysis.stress_score <= 3 ? '#52c41a' : analysis.stress_score <= 6 ? '#faad14' : '#f5222d'}
              format={() => `${analysis.stress_score}/10`}
            />
          </div>
        </Card>
      )}

      {/* AI洞察 */}
      {analysis && analysis.insights && (
        <Card
          title={<span className="gradient-text">🔍 AI洞察</span>}
          size="small"
          className="hover-card"
          style={{ 
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <List
            size="small"
            dataSource={analysis.insights}
            renderItem={(insight, index) => (
              <List.Item>
                <Space>
                  <BulbOutlined style={{ color: '#1890ff' }} />
                  <Text>{insight}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 个性化建议 */}
      {analysis && analysis.suggestions && (
        <Card
          title={<span className="gradient-text">💡 个性化建议</span>}
          size="small"
          className="hover-card"
          style={{ 
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <List
            dataSource={analysis.suggestions}
            renderItem={(suggestion) => (
              <List.Item>
                <Card
                  size="small"
                  style={{ width: '100%' }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{suggestion.title}</Text>
                      <Space>
                        <Tag color="blue">{suggestion.category}</Tag>
                        <Tag color={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority === 'high' ? '高优先级' : 
                           suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                        </Tag>
                      </Space>
                    </div>
                    <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                      {suggestion.description}
                    </Paragraph>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 模式识别 */}
      {analysis && analysis.patterns && analysis.patterns.length > 0 && (
        <Card
          title={<span className="gradient-text">📈 模式识别</span>}
          size="small"
          className="hover-card"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <Timeline>
            {analysis.patterns.map((pattern, index) => (
              <Timeline.Item
                key={index}
                dot={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              >
                <div>
                  <Text strong>{pattern.type}</Text>
                  <br />
                  <Text type="secondary">{pattern.description}</Text>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert
          message="分析失败"
          description={error}
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
}

export default SmartMoodAnalyzer;