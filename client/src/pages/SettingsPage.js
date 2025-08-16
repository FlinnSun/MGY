import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Slider,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  message,
  Form,
  Input,
  ColorPicker
} from 'antd';
import {
  SettingOutlined,
  FontSizeOutlined,
  EyeOutlined,
  SoundOutlined,
  BgColorsOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    readingFriendlyFont: false,
    largeFont: false,
    highContrast: false,
    voiceEnabled: false,
    fontSize: 16,
    voiceSpeed: 1,
    voicePitch: 1,
    theme: 'light',
    language: 'zh-CN',
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });

  useEffect(() => {
    // 从localStorage加载设置
    const savedSettings = localStorage.getItem('adhdSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('adhdSettings', JSON.stringify(newSettings));
    
    // 应用设置到页面
    applySettings(newSettings);
    message.success('设置已保存');
  };

  const applySettings = (newSettings) => {
    const body = document.body;
    
    // 应用字体设置
    if (newSettings.readingFriendlyFont) {
      body.classList.add('reading-friendly-font');
    } else {
      body.classList.remove('reading-friendly-font');
    }
    
    // 应用大字体设置
    if (newSettings.largeFont) {
      body.classList.add('large-font');
    } else {
      body.classList.remove('large-font');
    }
    
    // 应用高对比度设置
    if (newSettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // 应用字体大小
    body.style.fontSize = `${newSettings.fontSize}px`;
  };

  const resetSettings = () => {
    const defaultSettings = {
      readingFriendlyFont: false,
      largeFont: false,
      highContrast: false,
      voiceEnabled: false,
      fontSize: 16,
      voiceSpeed: 1,
      voicePitch: 1,
      theme: 'light',
      language: 'zh-CN',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('adhdSettings', JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
    message.success('设置已重置为默认值');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined /> 个性化设置
      </Title>
      <Text type="secondary">
        根据您的需求调整应用设置，提供更好的使用体验
      </Text>
      
      <Divider />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<><FontSizeOutlined /> 阅读辅助</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>阅读友好字体</Text>
                <Switch
                  checked={settings.readingFriendlyFont}
                  onChange={(checked) => handleSettingChange('readingFriendlyFont', checked)}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>大字体模式</Text>
                <Switch
                  checked={settings.largeFont}
                  onChange={(checked) => handleSettingChange('largeFont', checked)}
                />
              </div>
              
              <div>
                <Text>字体大小: {settings.fontSize}px</Text>
                <Slider
                  min={12}
                  max={24}
                  value={settings.fontSize}
                  onChange={(value) => handleSettingChange('fontSize', value)}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><EyeOutlined /> 视觉辅助</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>高对比度模式</Text>
                <Switch
                  checked={settings.highContrast}
                  onChange={(checked) => handleSettingChange('highContrast', checked)}
                />
              </div>
              
              <div>
                <Text>主题模式</Text>
                <Select
                  value={settings.theme}
                  onChange={(value) => handleSettingChange('theme', value)}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="light">浅色模式</Option>
                  <Option value="dark">深色模式</Option>
                  <Option value="auto">跟随系统</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><SoundOutlined /> 语音设置</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>启用语音播放</Text>
                <Switch
                  checked={settings.voiceEnabled}
                  onChange={(checked) => handleSettingChange('voiceEnabled', checked)}
                />
              </div>
              
              <div>
                <Text>语音速度: {settings.voiceSpeed}x</Text>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={settings.voiceSpeed}
                  onChange={(value) => handleSettingChange('voiceSpeed', value)}
                  style={{ marginTop: 8 }}
                  disabled={!settings.voiceEnabled}
                />
              </div>
              
              <div>
                <Text>语音音调: {settings.voicePitch}</Text>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={settings.voicePitch}
                  onChange={(value) => handleSettingChange('voicePitch', value)}
                  style={{ marginTop: 8 }}
                  disabled={!settings.voiceEnabled}
                />
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><BgColorsOutlined /> 其他设置</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>语言设置</Text>
                <Select
                  value={settings.language}
                  onChange={(value) => handleSettingChange('language', value)}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  danger 
                  onClick={resetSettings}
                  style={{ width: '100%' }}
                >
                  重置所有设置
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Card title="使用提示" size="small">
        <Space direction="vertical">
          <Text>• <strong>阅读友好字体</strong>：使用专为阅读障碍者设计的字体</Text>
          <Text>• <strong>大字体模式</strong>：增大所有文字的显示大小</Text>
          <Text>• <strong>高对比度模式</strong>：提高文字与背景的对比度</Text>
          <Text>• <strong>语音播放</strong>：支持文本转语音功能</Text>
          <Text>• 所有设置会自动保存到本地，下次打开时会自动应用</Text>
        </Space>
      </Card>
    </div>
  );
};

export default SettingsPage;