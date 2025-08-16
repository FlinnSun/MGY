import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Row, 
  Col,
  Typography,
  Space,
  message,
  Avatar,
  List,
  Tag,
  Modal,
  Form,
  Select,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  Rate,
  Empty,
  Spin
} from 'antd';
import {
  TeamOutlined,
  MessageOutlined,
  LikeOutlined,
  ShareAltOutlined,
  PlusOutlined,
  BookOutlined,
  HeartOutlined,
  BulbOutlined,
  CommentOutlined,
  UserOutlined,
  StarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TagOutlined,
  SendOutlined,
  SmileOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // 模拟社区数据
      const mockPosts = [
        {
          id: '1',
          title: '分享一个提高阅读专注力的小技巧',
          content: '我发现使用番茄钟技术配合阅读辅助工具效果很好。每25分钟专注阅读，然后休息5分钟。这样可以避免注意力分散，提高理解效率。',
          author: {
            name: '小明同学',
            avatar: '👨‍🎓',
            level: 'ADHD学生'
          },
          category: 'reading',
          tags: ['阅读技巧', '专注力', '番茄钟'],
          likes: 23,
          comments: 8,
          views: 156,
          created_at: dayjs().subtract(2, 'hour').format(),
          isLiked: false,
          commentList: [
            {
              id: 'c1',
              author: '小红',
              avatar: '👩‍🎓',
              content: '这个方法我也在用，确实很有效！',
              created_at: dayjs().subtract(1, 'hour').format(),
              likes: 3
            },
            {
              id: 'c2',
              author: '学习小助手',
              avatar: '🤖',
              content: '番茄钟技术对ADHD学生特别有帮助，建议大家都试试。',
              created_at: dayjs().subtract(30, 'minute').format(),
              likes: 5
            }
          ]
        },
        {
          id: '2',
          title: '如何建立稳定的作息时间？',
          content: '作为ADHD患者，我一直很难保持规律的作息。最近尝试了一些方法，想和大家分享。首先是固定起床时间，即使周末也不例外...',
          author: {
            name: '阳光小鸟',
            avatar: '🐦',
            level: '生活达人'
          },
          category: 'lifestyle',
          tags: ['作息', '生活习惯', '时间管理'],
          likes: 45,
          comments: 12,
          views: 289,
          created_at: dayjs().subtract(5, 'hour').format(),
          isLiked: true,
          commentList: []
        },
        {
          id: '3',
          title: '推荐几本适合ADHD学生的书籍',
          content: '这些书籍都有清晰的结构和简洁的语言，非常适合我们阅读：\n1. 《专注力训练手册》\n2. 《时间管理的艺术》\n3. 《情绪管理指南》',
          author: {
            name: '书虫小王',
            avatar: '📚',
            level: '阅读爱好者'
          },
          category: 'reading',
          tags: ['书籍推荐', '学习资源'],
          likes: 67,
          comments: 15,
          views: 423,
          created_at: dayjs().subtract(1, 'day').format(),
          isLiked: false,
          commentList: []
        },
        {
          id: '4',
          title: '情绪低落时如何调节？',
          content: '最近情绪起伏比较大，想请教大家都是怎么调节情绪的？我试过深呼吸和听音乐，但效果不太明显。',
          author: {
            name: '小星星',
            avatar: '⭐',
            level: '新手'
          },
          category: 'emotion',
          tags: ['情绪调节', '心理健康'],
          likes: 34,
          comments: 20,
          views: 198,
          created_at: dayjs().subtract(2, 'day').format(),
          isLiked: false,
          commentList: []
        },
        {
          id: '5',
          title: '分享我的任务管理系统',
          content: '经过长期摸索，我建立了一套适合ADHD的任务管理系统。核心是将大任务分解成小步骤，每完成一步就给自己一个小奖励。',
          author: {
            name: '效率达人',
            avatar: '⚡',
            level: '管理专家'
          },
          category: 'productivity',
          tags: ['任务管理', '效率提升', '自我奖励'],
          likes: 89,
          comments: 25,
          views: 567,
          created_at: dayjs().subtract(3, 'day').format(),
          isLiked: true,
          commentList: []
        },
        {
          id: '6',
          title: '睡眠质量改善心得',
          content: '通过调整睡前习惯和使用白噪音，我的睡眠质量有了明显改善。现在每天都能保证7-8小时的优质睡眠。',
          author: {
            name: '好梦成真',
            avatar: '🌙',
            level: '睡眠专家'
          },
          category: 'sleep',
          tags: ['睡眠改善', '白噪音', '睡前习惯'],
          likes: 52,
          comments: 18,
          views: 334,
          created_at: dayjs().subtract(4, 'day').format(),
          isLiked: false,
          commentList: []
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      message.error('加载社区内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (values) => {
    try {
      const newPost = {
        id: Date.now().toString(),
        title: values.title,
        content: values.content,
        author: {
          name: '我',
          avatar: '👤',
          level: 'ADHD学生'
        },
        category: values.category,
        tags: values.tags || [],
        likes: 0,
        comments: 0,
        views: 1,
        created_at: dayjs().format(),
        isLiked: false,
        commentList: []
      };

      setPosts(prev => [newPost, ...prev]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('发布成功！');
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    const comment = {
      id: Date.now().toString(),
      author: '我',
      avatar: '👤',
      content: newComment,
      created_at: dayjs().format(),
      likes: 0
    };

    setPosts(prev => prev.map(post => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: post.comments + 1,
          commentList: [...post.commentList, comment]
        };
      }
      return post;
    }));

    setNewComment('');
    message.success('评论发布成功！');
  };

  const getCategoryName = (category) => {
    const categories = {
      all: '全部',
      reading: '阅读交流',
      lifestyle: '生活分享',
      emotion: '情绪支持',
      productivity: '效率提升',
      sleep: '睡眠健康'
    };
    return categories[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      reading: <BookOutlined />,
      lifestyle: <SmileOutlined />,
      emotion: <HeartOutlined />,
      productivity: <BulbOutlined />,
      sleep: <ClockCircleOutlined />
    };
    return icons[category] || <MessageOutlined />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      reading: '#1890ff',
      lifestyle: '#52c41a',
      emotion: '#ff7875',
      productivity: '#faad14',
      sleep: '#722ed1'
    };
    return colors[category] || '#666';
  };

  const filteredPosts = activeTab === 'all' ? posts : posts.filter(post => post.category === activeTab);

  const categories = [
    { key: 'all', name: '全部', icon: <TeamOutlined />, count: posts.length },
    { key: 'reading', name: '阅读交流', icon: <BookOutlined />, count: posts.filter(p => p.category === 'reading').length },
    { key: 'lifestyle', name: '生活分享', icon: <SmileOutlined />, count: posts.filter(p => p.category === 'lifestyle').length },
    { key: 'emotion', name: '情绪支持', icon: <HeartOutlined />, count: posts.filter(p => p.category === 'emotion').length },
    { key: 'productivity', name: '效率提升', icon: <BulbOutlined />, count: posts.filter(p => p.category === 'productivity').length },
    { key: 'sleep', name: '睡眠健康', icon: <ClockCircleOutlined />, count: posts.filter(p => p.category === 'sleep').length }
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <TeamOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          ADHD社区
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalVisible(true)}
        >
          发布动态
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* 侧边栏 - 分类导航 */}
        <Col xs={24} lg={6}>
          <Card title="社区分类" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {categories.map(category => (
                <Button
                  key={category.key}
                  type={activeTab === category.key ? 'primary' : 'text'}
                  block
                  style={{ textAlign: 'left', height: 'auto', padding: '8px 16px' }}
                  onClick={() => setActiveTab(category.key)}
                >
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      {category.icon}
                      {category.name}
                    </Space>
                    <Badge count={category.count} style={{ backgroundColor: '#f0f0f0', color: '#666' }} />
                  </Space>
                </Button>
              ))}
            </Space>
          </Card>

          <Card title="社区公告" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" size="small">
              <Text type="secondary">📢 欢迎新成员加入ADHD互助社区！</Text>
              <Text type="secondary">💡 分享你的学习和生活经验</Text>
              <Text type="secondary">🤝 互相支持，共同成长</Text>
              <Text type="secondary">📚 推荐优质学习资源</Text>
            </Space>
          </Card>
        </Col>

        {/* 主内容区 */}
        <Col xs={24} lg={18}>
          <Spin spinning={loading}>
            {filteredPosts.length === 0 ? (
              <Empty description="暂无内容" />
            ) : (
              <List
                itemLayout="vertical"
                size="large"
                dataSource={filteredPosts}
                renderItem={(post) => (
                  <List.Item
                    key={post.id}
                    actions={[
                      <Button 
                        type="text" 
                        icon={<LikeOutlined style={{ color: post.isLiked ? '#ff4d4f' : undefined }} />}
                        onClick={() => handleLike(post.id)}
                      >
                        {post.likes}
                      </Button>,
                      <Button 
                        type="text" 
                        icon={<CommentOutlined />}
                        onClick={() => handleComment(post)}
                      >
                        {post.comments}
                      </Button>,
                      <Button type="text" icon={<ShareAltOutlined />}>分享</Button>,
                      <Space>
                        <EyeOutlined />
                        <Text type="secondary">{post.views}</Text>
                      </Space>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar size={48} style={{ backgroundColor: '#f56a00' }}>
                          {post.author.avatar}
                        </Avatar>
                      }
                      title={
                        <Space direction="vertical" size={4}>
                          <Space>
                            <Text strong style={{ fontSize: 16 }}>{post.title}</Text>
                            <Tag 
                              color={getCategoryColor(post.category)}
                              icon={getCategoryIcon(post.category)}
                            >
                              {getCategoryName(post.category)}
                            </Tag>
                          </Space>
                          <Space>
                            <Text type="secondary">{post.author.name}</Text>
                            <Tag size="small">{post.author.level}</Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(post.created_at).fromNow()}
                            </Text>
                          </Space>
                        </Space>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <Paragraph 
                            ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                            style={{ marginBottom: 8, whiteSpace: 'pre-line' }}
                          >
                            {post.content}
                          </Paragraph>
                          <Space wrap>
                            {post.tags.map(tag => (
                              <Tag key={tag} icon={<TagOutlined />}>{tag}</Tag>
                            ))}
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Col>
      </Row>

      {/* 发布动态模态框 */}
      <Modal
        title="发布新动态"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePost}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="输入一个吸引人的标题..." />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              <Option value="reading">阅读交流</Option>
              <Option value="lifestyle">生活分享</Option>
              <Option value="emotion">情绪支持</Option>
              <Option value="productivity">效率提升</Option>
              <Option value="sleep">睡眠健康</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea
              rows={6}
              placeholder="分享你的经验、感受或问题...\n\n小贴士：\n- 详细描述你的情况\n- 分享具体的方法和技巧\n- 提出明确的问题\n- 保持积极和支持的态度"
            />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="添加相关标签（可自定义）"
              options={[
                { value: '阅读技巧' },
                { value: '专注力' },
                { value: '时间管理' },
                { value: '情绪调节' },
                { value: '睡眠改善' },
                { value: '学习方法' },
                { value: '生活习惯' },
                { value: '心理健康' }
              ]}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                发布
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 评论模态框 */}
      <Modal
        title={`评论 - ${selectedPost?.title}`}
        visible={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
          setNewComment('');
        }}
        footer={null}
        width={700}
      >
        {selectedPost && (
          <div>
            {/* 原帖内容 */}
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
              <Space>
                <Avatar>{selectedPost.author.avatar}</Avatar>
                <div>
                  <Text strong>{selectedPost.author.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(selectedPost.created_at).fromNow()}
                  </Text>
                </div>
              </Space>
              <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                {selectedPost.content}
              </Paragraph>
            </Card>

            {/* 评论列表 */}
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
              {selectedPost.commentList.length === 0 ? (
                <Empty description="暂无评论" size="small" />
              ) : (
                selectedPost.commentList.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', marginBottom: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 6 }}>
                    <Avatar style={{ marginRight: 12 }}>{comment.avatar}</Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}>
                        <Text strong>{comment.author}</Text>
                        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                          {dayjs(comment.created_at).fromNow()}
                        </Text>
                      </div>
                      <Text>{comment.content}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Button type="text" size="small" icon={<LikeOutlined />}>
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Divider />

            {/* 添加评论 */}
            <div>
              <TextArea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={3}
                style={{ marginBottom: 8 }}
              />
              <div style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleAddComment}
                >
                  发布评论
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CommunityPage;