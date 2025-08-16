import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  List,
  Typography,
  Space,
  Spin,
  Alert,
  Tag,
  Card,
  Divider,
  Tooltip,
  Progress
} from 'antd';
import {
  BulbOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

function SmartTaskDecomposer({ visible, onClose, onTasksCreated }) {
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [decomposedTasks, setDecomposedTasks] = useState(null);
  const [error, setError] = useState(null);

  const handleDecompose = async () => {
    if (!taskDescription.trim()) return;

    setLoading(true);
    setError(null);
    setDecomposedTasks(null);

    try {
      const response = await axios.post('/api/ai/task-decompose', {
        task_description: taskDescription,
        user_context: {
          user_id: 'default-user',
          preferences: {
            difficulty_preference: 'medium',
            time_preference: 'flexible'
          }
        }
      });

      if (response.data.success) {
        setDecomposedTasks(response.data.data || response.data.fallback);
      } else {
        setError(response.data.error || '任务分解失败');
      }
    } catch (error) {
      console.error('任务分解失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!decomposedTasks || !decomposedTasks.subtasks) return;

    try {
      const tasksToCreate = decomposedTasks.subtasks.map(subtask => ({
        title: subtask.title,
        description: subtask.description,
        priority: subtask.priority || 'medium',
        estimated_time: subtask.estimated_time || 30,
        category: subtask.category || 'general',
        due_date: subtask.due_date || null
      }));

      // 创建主任务
      const mainTaskResponse = await axios.post('/api/tasks', {
        title: decomposedTasks.main_task?.title || taskDescription,
        description: decomposedTasks.main_task?.description || taskDescription,
        priority: decomposedTasks.main_task?.priority || 'medium',
        estimated_time: decomposedTasks.main_task?.estimated_time || 60,
        category: decomposedTasks.main_task?.category || 'general'
      });

      // 创建子任务
      const subtaskPromises = tasksToCreate.map(task => 
        axios.post('/api/tasks', task)
      );

      await Promise.all(subtaskPromises);

      if (onTasksCreated) {
        onTasksCreated({
          mainTask: mainTaskResponse.data,
          subtasks: tasksToCreate
        });
      }

      handleClose();
    } catch (error) {
      console.error('创建任务失败:', error);
      setError('创建任务失败，请重试');
    }
  };

  const handleClose = () => {
    setTaskDescription('');
    setDecomposedTasks(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'hard': return 'red';
      case 'medium': return 'orange';
      case 'easy': return 'green';
      default: return 'blue';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BulbOutlined style={{ color: '#1890ff' }} />
          <span className="gradient-text">智能任务分解</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
      destroyOnClose
      className="smart-decomposer-modal"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px'
      }}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* 输入区域 */}
        <Card 
          size="small" 
          className="hover-card"
          style={{ 
            marginBottom: 16,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>描述您要完成的任务：</Text>
            <TextArea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="例如：准备期末考试、完成项目报告、学习新技能等..."
              rows={3}
              disabled={loading}
            />
            <Space>
              <Button
                type="primary"
                icon={<BulbOutlined />}
                onClick={handleDecompose}
                loading={loading}
                disabled={!taskDescription.trim()}
                className="pulse"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                智能分解
              </Button>
              {decomposedTasks && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleDecompose}
                  disabled={loading}
                >
                  重新分解
                </Button>
              )}
            </Space>
          </Space>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert
            message="分解失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 加载状态 */}
        {loading && (
          <Card style={{ textAlign: 'center', marginBottom: 16 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">AI正在分析您的任务...</Text>
            </div>
          </Card>
        )}

        {/* 分解结果 */}
        {decomposedTasks && (
          <div className="fade-in">
            {/* 主任务信息 */}
            {decomposedTasks.main_task && (
              <Card
                title="主任务概览"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>{decomposedTasks.main_task.title}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Space wrap>
                        <Tag color={getPriorityColor(decomposedTasks.main_task.priority)}>
                          <FlagOutlined /> {decomposedTasks.main_task.priority || 'medium'}
                        </Tag>
                        <Tag color="blue">
                          <ClockCircleOutlined /> {decomposedTasks.main_task.estimated_time || 60}分钟
                        </Tag>
                        {decomposedTasks.main_task.category && (
                          <Tag>{decomposedTasks.main_task.category}</Tag>
                        )}
                      </Space>
                    </div>
                  </div>
                  {decomposedTasks.main_task.description && (
                    <Paragraph type="secondary">
                      {decomposedTasks.main_task.description}
                    </Paragraph>
                  )}
                </Space>
              </Card>
            )}

            {/* 分解建议 */}
            {decomposedTasks.analysis && (
              <Card
                title="AI分析建议"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {decomposedTasks.analysis.complexity && (
                    <div>
                      <Text strong>复杂度评估：</Text>
                      <Tag color={getDifficultyColor(decomposedTasks.analysis.complexity)}>
                        {decomposedTasks.analysis.complexity}
                      </Tag>
                    </div>
                  )}
                  {decomposedTasks.analysis.estimated_total_time && (
                    <div>
                      <Text strong>预计总时间：</Text>
                      <Text>{decomposedTasks.analysis.estimated_total_time}分钟</Text>
                    </div>
                  )}
                  {decomposedTasks.analysis.suggestions && (
                    <div>
                      <Text strong>建议：</Text>
                      <Paragraph>{decomposedTasks.analysis.suggestions}</Paragraph>
                    </div>
                  )}
                </Space>
              </Card>
            )}

            {/* 子任务列表 */}
            {decomposedTasks.subtasks && decomposedTasks.subtasks.length > 0 && (
              <Card
                title={`子任务列表 (${decomposedTasks.subtasks.length}个)`}
                size="small"
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={decomposedTasks.subtasks}
                  renderItem={(subtask, index) => (
                    <List.Item>
                      <Card
                        size="small"
                        style={{ width: '100%' }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <Text strong>{subtask.title}</Text>
                              <div style={{ marginTop: 4 }}>
                                <Space wrap>
                                  <Tag color={getPriorityColor(subtask.priority)}>
                                    <FlagOutlined /> {subtask.priority || 'medium'}
                                  </Tag>
                                  <Tag color="blue">
                                    <ClockCircleOutlined /> {subtask.estimated_time || 30}分钟
                                  </Tag>
                                  {subtask.difficulty && (
                                    <Tag color={getDifficultyColor(subtask.difficulty)}>
                                      {subtask.difficulty}
                                    </Tag>
                                  )}
                                  {subtask.category && (
                                    <Tag>{subtask.category}</Tag>
                                  )}
                                </Space>
                              </div>
                            </div>
                            <Text type="secondary">#{index + 1}</Text>
                          </div>
                          {subtask.description && (
                            <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                              {subtask.description}
                            </Paragraph>
                          )}
                          {subtask.tips && subtask.tips.length > 0 && (
                            <div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>💡 提示：</Text>
                              <ul style={{ margin: '4px 0 0 16px', fontSize: '12px' }}>
                                {subtask.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex}>
                                    <Text type="secondary">{tip}</Text>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* 操作按钮 */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Space>
                <Button onClick={handleClose}>
                  取消
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleCreateTasks}
                  size="large"
                >
                  创建所有任务
                </Button>
              </Space>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default SmartTaskDecomposer;