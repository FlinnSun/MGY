import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  List, 
  Checkbox, 
  Tag, 
  Modal, 
  Space, 
  Row, 
  Col,
  Tabs,
  Progress,
  message,
  Popconfirm,
  Typography,
  Calendar,
  Badge,
  Statistic,
  Divider,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  CalendarOutlined,
  BellOutlined,
  TrophyOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
  BulbOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import SmartTaskDecomposer from '../components/SmartTaskDecomposer';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [smartDecomposerVisible, setSmartDecomposerVisible] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed && new Date(task.due_date) >= new Date()).length;
    const overdue = tasks.filter(task => !task.completed && new Date(task.due_date) < new Date()).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setTaskStats({
      total,
      completed,
      pending,
      overdue,
      completionRate
    });
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      // 模拟数据
      const mockTasks = [
        {
          id: '1',
          title: '完成数学作业',
          description: '第3章练习题1-10',
          priority: 'high',
          due_date: dayjs().format('YYYY-MM-DD'),
          completed: false,
          category: 'study',
          created_at: dayjs().subtract(1, 'hour').toISOString()
        },
        {
          id: '2',
          title: '阅读科学故事',
          description: '使用阅读助手完成今日阅读任务',
          priority: 'medium',
          due_date: dayjs().format('YYYY-MM-DD'),
          completed: true,
          category: 'reading',
          created_at: dayjs().subtract(2, 'hour').toISOString()
        },
        {
          id: '3',
          title: '整理书桌',
          description: '把学习用品分类整理',
          priority: 'low',
          due_date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
          completed: false,
          category: 'life',
          created_at: dayjs().subtract(3, 'hour').toISOString()
        },
        {
          id: '4',
          title: '记录今日情绪',
          description: '在情绪记录页面记录今天的心情',
          priority: 'medium',
          due_date: dayjs().format('YYYY-MM-DD'),
          completed: false,
          category: 'health',
          created_at: dayjs().subtract(30, 'minute').toISOString()
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const taskData = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        id: editingTask ? editingTask.id : Date.now().toString(),
        completed: editingTask ? editingTask.completed : false,
        created_at: editingTask ? editingTask.created_at : new Date().toISOString()
      };

      if (editingTask) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? taskData : task
        ));
        message.success('任务更新成功');
      } else {
        setTasks(prev => [taskData, ...prev]);
        message.success('任务创建成功');
      }

      setModalVisible(false);
      setEditingTask(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      due_date: task.due_date ? dayjs(task.due_date) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (taskId) => {
    try {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      message.success('任务删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
      message.success('任务状态更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'study': return 'blue';
      case 'reading': return 'purple';
      case 'life': return 'cyan';
      case 'health': return 'pink';
      default: return 'default';
    }
  };

  const filterTasksByDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return tasks.filter(task => task.due_date === dateStr);
  };

  const getTasksForTab = (tab) => {
    const today = dayjs();
    switch (tab) {
      case 'today':
        return tasks.filter(task => task.due_date === today.format('YYYY-MM-DD'));
      case 'week':
        const weekStart = today.startOf('week');
        const weekEnd = today.endOf('week');
        return tasks.filter(task => {
          const taskDate = dayjs(task.due_date);
          return taskDate.isAfter(weekStart.subtract(1, 'day')) && taskDate.isBefore(weekEnd.add(1, 'day'));
        });
      case 'all':
        return tasks;
      default:
        return tasks;
    }
  };

  const getTaskStats = () => {
    const todayTasks = getTasksForTab('today');
    const completed = todayTasks.filter(task => task.completed).length;
    const total = todayTasks.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const stats = getTaskStats();
  const currentTasks = getTasksForTab(activeTab);

  const dateCellRender = (value) => {
    const dayTasks = filterTasksByDate(value);
    if (dayTasks.length === 0) return null;
    
    const completed = dayTasks.filter(task => task.completed).length;
    const total = dayTasks.length;
    
    return (
      <div>
        <Badge 
          count={total} 
          style={{ backgroundColor: completed === total ? '#52c41a' : '#1890ff' }}
        />
      </div>
    );
  };

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <CheckSquareOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          任务管理
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建任务
          </Button>
          <Button 
            type="default" 
            icon={<BulbOutlined />}
            onClick={() => setSmartDecomposerVisible(true)}
          >
            智能分解
          </Button>
        </Space>
      </div>

      {/* 任务统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="总任务数"
              value={taskStats.total}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="已完成"
              value={taskStats.completed}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckSquareOutlined style={{ color: '#3f8600' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="进行中"
              value={taskStats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable>
            <Statistic
              title="已逾期"
              value={taskStats.overdue}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card title={<><TrophyOutlined /> 完成进度</>} hoverable>
            <Progress
              type="circle"
              percent={taskStats.completionRate}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={percent => (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{percent}%</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>完成率</div>
                </div>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={<><FireOutlined /> 今日目标</>} hoverable>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '18px', marginBottom: 8 }}>今日计划完成</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                {tasks.filter(task => 
                  !task.completed && 
                  task.due_date === dayjs().format('YYYY-MM-DD')
                ).length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>个任务</div>
              <Space style={{ marginTop: 16 }}>
                <Button icon={<CalendarOutlined />} onClick={() => setActiveTab('calendar')}>日历视图</Button>
                <Button icon={<BellOutlined />}>设置提醒</Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="今日任务" key="today">
                <List
                  dataSource={currentTasks}
                  renderItem={(task) => (
                    <List.Item
                      className={`priority-${task.priority}`}
                      style={{
                        opacity: task.completed ? 0.6 : 1,
                        backgroundColor: task.completed ? '#f6ffed' : 'white'
                      }}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(task)}
                        />,
                        <Popconfirm
                          title="确定删除这个任务吗？"
                          onConfirm={() => handleDelete(task.id)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Checkbox
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                          />
                        }
                        title={
                          <Space>
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            <Tag color={getPriorityColor(task.priority)}>
                              <FlagOutlined /> {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                            </Tag>
                            <Tag color={getCategoryColor(task.category)}>
                              {task.category === 'study' ? '学习' : 
                               task.category === 'reading' ? '阅读' :
                               task.category === 'life' ? '生活' : '健康'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{task.description}</div>
                            {task.due_date && (
                              <Text type="secondary">
                                <ClockCircleOutlined /> 截止：{task.due_date}
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无任务' }}
                />
              </TabPane>
              
              <TabPane tab="本周任务" key="week">
                <List
                  dataSource={currentTasks}
                  renderItem={(task) => (
                    <List.Item
                      className={`priority-${task.priority}`}
                      style={{
                        opacity: task.completed ? 0.6 : 1,
                        backgroundColor: task.completed ? '#f6ffed' : 'white'
                      }}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(task)}
                        />,
                        <Popconfirm
                          title="确定删除这个任务吗？"
                          onConfirm={() => handleDelete(task.id)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Checkbox
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                          />
                        }
                        title={
                          <Space>
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            <Tag color={getPriorityColor(task.priority)}>
                              <FlagOutlined /> {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                            </Tag>
                            <Tag color={getCategoryColor(task.category)}>
                              {task.category === 'study' ? '学习' : 
                               task.category === 'reading' ? '阅读' :
                               task.category === 'life' ? '生活' : '健康'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{task.description}</div>
                            {task.due_date && (
                              <Text type="secondary">
                                <ClockCircleOutlined /> 截止：{task.due_date}
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无任务' }}
                />
              </TabPane>
              
              <TabPane tab="所有任务" key="all">
                <List
                  dataSource={currentTasks}
                  renderItem={(task) => (
                    <List.Item
                      className={`priority-${task.priority}`}
                      style={{
                        opacity: task.completed ? 0.6 : 1,
                        backgroundColor: task.completed ? '#f6ffed' : 'white'
                      }}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(task)}
                        />,
                        <Popconfirm
                          title="确定删除这个任务吗？"
                          onConfirm={() => handleDelete(task.id)}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Checkbox
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                          />
                        }
                        title={
                          <Space>
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            <Tag color={getPriorityColor(task.priority)}>
                              <FlagOutlined /> {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                            </Tag>
                            <Tag color={getCategoryColor(task.category)}>
                              {task.category === 'study' ? '学习' : 
                               task.category === 'reading' ? '阅读' :
                               task.category === 'life' ? '生活' : '健康'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{task.description}</div>
                            {task.due_date && (
                              <Text type="secondary">
                                <ClockCircleOutlined /> 截止：{task.due_date}
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无任务' }}
                />
              </TabPane>
              
              <TabPane tab="日历视图" key="calendar">
                <Calendar 
                  dateCellRender={dateCellRender}
                  onSelect={(date) => setSelectedDate(date)}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="快速添加" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                onClick={() => {
                  form.setFieldsValue({
                    title: '完成今日阅读',
                    category: 'reading',
                    priority: 'medium',
                    due_date: dayjs()
                  });
                  setModalVisible(true);
                }}
              >
                添加阅读任务
              </Button>
              <Button 
                block 
                onClick={() => {
                  form.setFieldsValue({
                    title: '记录情绪状态',
                    category: 'health',
                    priority: 'low',
                    due_date: dayjs()
                  });
                  setModalVisible(true);
                }}
              >
                添加情绪记录
              </Button>
              <Button 
                block 
                onClick={() => {
                  form.setFieldsValue({
                    title: '整理学习用品',
                    category: 'life',
                    priority: 'low',
                    due_date: dayjs()
                  });
                  setModalVisible(true);
                }}
              >
                添加生活任务
              </Button>
            </Space>
          </Card>
          
          <Card title="任务提醒">
            <List
              size="small"
              dataSource={tasks.filter(task => !task.completed && task.due_date === dayjs().format('YYYY-MM-DD'))}
              renderItem={(task) => (
                <List.Item>
                  <Text>{task.title}</Text>
                  <Tag color={getPriorityColor(task.priority)} size="small">
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </Tag>
                </List.Item>
              )}
              locale={{ emptyText: '今日无待办任务' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新建/编辑任务模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="选择优先级">
                  <Option value="high">高优先级</Option>
                  <Option value="medium">中优先级</Option>
                  <Option value="low">低优先级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="选择分类">
                  <Option value="study">学习</Option>
                  <Option value="reading">阅读</Option>
                  <Option value="life">生活</Option>
                  <Option value="health">健康</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="due_date"
            label="截止日期"
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择截止日期" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTask ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingTask(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 智能任务分解器 */}
      <SmartTaskDecomposer
        visible={smartDecomposerVisible}
        onClose={() => setSmartDecomposerVisible(false)}
        onTasksCreated={(result) => {
          message.success(`成功创建主任务和${result.subtasks.length}个子任务！`);
          loadTasks(); // 重新加载任务列表
        }}
      />
    </div>
  );
}

export default TaskPage;