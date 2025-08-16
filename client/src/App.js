import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Switch, Button, Tooltip, FloatButton, Badge } from 'antd';
import {
  ReadOutlined,
  CheckSquareOutlined,
  HeartOutlined,
  MoonOutlined,
  TeamOutlined,
  SettingOutlined,
  SoundOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
  HomeOutlined,
  RobotOutlined
} from '@ant-design/icons';
import './App.css';

// 导入页面组件
import HomePage from './pages/HomePage';
import ReadingPage from './pages/ReadingPage';
import TaskPage from './pages/TaskPage';
import MoodPage from './pages/MoodPage';
import SleepPage from './pages/SleepPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import AIConfigPage from './pages/AIConfigPage';
import AIAssistant from './components/AIAssistant';

const { Header, Content, Sider } = Layout;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    readingFriendlyFont: false,
    largeFont: false,
    highContrast: false,
    speechEnabled: true,
    keyboardNavigation: false
  });
  const [notifications, setNotifications] = useState(3);
  const [aiAssistantVisible, setAiAssistantVisible] = useState(false);

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('adhdSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem('adhdSettings', JSON.stringify(settings));
    
    // 应用全局样式
    const body = document.body;
    body.className = '';
    
    if (settings.readingFriendlyFont) {
      body.classList.add('reading-friendly');
    }
    if (settings.largeFont) {
      body.classList.add('large-font');
    }
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }
    if (settings.keyboardNavigation) {
      body.classList.add('keyboard-navigation');
    }
  }, [settings]);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/reading',
      icon: <ReadOutlined />,
      label: '阅读助手',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
    },
    {
      key: '/mood',
      icon: <HeartOutlined />,
      label: '情绪记录',
    },
    {
      key: '/sleep',
      icon: <MoonOutlined />,
      label: '睡眠助手',
    },
    {
      key: '/community',
      icon: <TeamOutlined />,
      label: '社区交流',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: '/ai-config',
      icon: <RobotOutlined />,
      label: 'AI配置',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        width={200}
      >
        <div className="logo" style={{ 
          height: 64, 
          margin: 16, 
          background: '#1890ff',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: collapsed ? 14 : 16
        }}>
          {collapsed ? 'ADHD' : 'ADHD助手'}
        </div>
        <Menu
          theme="light"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, color: '#1890ff' }}>
            ADHD学习助手
          </h1>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Tooltip title="阅读友好字体">
              <Switch
                checked={settings.readingFriendlyFont}
                onChange={() => toggleSetting('readingFriendlyFont')}
                checkedChildren={<FontSizeOutlined />}
                unCheckedChildren={<FontSizeOutlined />}
              />
            </Tooltip>
            
            <Tooltip title="大字体模式">
              <Switch
                checked={settings.largeFont}
                onChange={() => toggleSetting('largeFont')}
                checkedChildren="大"
                unCheckedChildren="小"
              />
            </Tooltip>
            
            <Tooltip title="高对比度模式">
              <Switch
                checked={settings.highContrast}
                onChange={() => toggleSetting('highContrast')}
                checkedChildren={<BgColorsOutlined />}
                unCheckedChildren={<BgColorsOutlined />}
              />
            </Tooltip>
            
            <Tooltip title="语音播放">
              <Switch
                checked={settings.speechEnabled}
                onChange={() => toggleSetting('speechEnabled')}
                checkedChildren={<SoundOutlined />}
                unCheckedChildren={<SoundOutlined />}
              />
            </Tooltip>
            
            <Badge count={notifications} size="small">
              <Tooltip title="通知">
                <span style={{ cursor: 'pointer', padding: '4px 8px' }}>🔔</span>
              </Tooltip>
            </Badge>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          borderRadius: 6,
          minHeight: 280
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reading" element={<ReadingPage settings={settings} />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/sleep" element={<SleepPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/settings" element={<SettingsPage settings={settings} setSettings={setSettings} />} />
            <Route path="/ai-config" element={<AIConfigPage />} />
          </Routes>
        </Content>
      </Layout>
      
      {/* 悬浮按钮 */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<SettingOutlined />}
      >
        <FloatButton 
          icon={<RobotOutlined />} 
          tooltip="AI助手"
          onClick={() => setAiAssistantVisible(true)}
        />
        <FloatButton 
          icon={<ReadOutlined />} 
          tooltip="快速阅读"
          onClick={() => navigate('/reading')}
        />
        <FloatButton 
          icon={<CheckSquareOutlined />} 
          tooltip="添加任务"
          onClick={() => navigate('/tasks')}
        />
        <FloatButton 
          icon={<HeartOutlined />} 
          tooltip="记录情绪"
          onClick={() => navigate('/mood')}
        />
      </FloatButton.Group>
      
      <AIAssistant
        visible={aiAssistantVisible}
        onClose={() => setAiAssistantVisible(false)}
        userId="default-user"
      />
    </Layout>
  );
}

export default App;