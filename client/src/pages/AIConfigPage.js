import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Typography, Alert, Divider } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const AIConfigPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get('/api/ai/config');
      const { configured, model, baseUrl } = response.data;
      setConfigured(configured);
      form.setFieldsValue({
        model: model || 'glm-4',
        baseUrl: baseUrl || 'https://open.bigmodel.cn/api/paas/v4'
      });
    } catch (error) {
      message.error('加载配置失败');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/config', values);
      if (response.data.success) {
        message.success('AI配置保存成功！');
        setConfigured(true);
        setTestResult(null);
      }
    } catch (error) {
      message.error(error.response?.data?.error || '配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await axios.post('/api/ai/test');
      setTestResult(response.data);
      if (response.data.success) {
        message.success('AI连接测试成功！');
      } else {
        message.error('AI连接测试失败');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || '测试请求失败'
      });
      message.error('连接测试失败');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="warm-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card className="warm-section">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ApiOutlined style={{ fontSize: '48px', color: '#ff9a56', marginBottom: '16px' }} />
          <Title level={2} className="warm-text">智谱AI配置</Title>
          <Paragraph type="secondary">
            配置智谱AI API密钥以启用AI助手功能，包括智能问答、任务分解、情绪分析等。
          </Paragraph>
        </div>

        {configured ? (
          <Alert
            message="AI服务已配置"
            description="智谱AI API已成功配置，AI功能可正常使用。"
            type="success"
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '24px' }}
          />
        ) : (
          <Alert
            message="AI服务未配置"
            description="请配置智谱AI API密钥以启用AI功能。"
            type="warning"
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            model: 'glm-4',
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
          }}
        >
          <Form.Item
            label="API密钥"
            name="apiKey"
            rules={[
              { required: true, message: '请输入智谱AI API密钥' },
              { min: 10, message: 'API密钥长度不能少于10个字符' }
            ]}
          >
            <Input.Password
              placeholder="请输入您的智谱AI API密钥"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="模型名称"
            name="model"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input
              placeholder="glm-4"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="API基础URL"
            name="baseUrl"
            rules={[
              { required: true, message: '请输入API基础URL' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input
              placeholder="https://open.bigmodel.cn/api/paas/v4"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b9d 100%)',
                  border: 'none',
                  minWidth: '120px'
                }}
              >
                保存配置
              </Button>
              <Button
                onClick={handleTest}
                loading={testing}
                disabled={!configured}
                size="large"
                style={{
                  borderRadius: '8px',
                  minWidth: '120px'
                }}
              >
                测试连接
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {testResult && (
          <>
            <Divider />
            <Alert
              message={testResult.success ? '连接测试成功' : '连接测试失败'}
              description={
                <div>
                  <Text>{testResult.message}</Text>
                  {testResult.response && (
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>AI回复：</Text>
                      <Text code>{testResult.response}</Text>
                    </div>
                  )}
                </div>
              }
              type={testResult.success ? 'success' : 'error'}
              style={{ marginTop: '16px' }}
            />
          </>
        )}

        <Divider />
        
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
          <Title level={4} style={{ color: '#666', marginBottom: '12px' }}>📝 配置说明</Title>
          <Paragraph style={{ margin: 0, color: '#666' }}>
            <Text strong>1. 获取API密钥：</Text> 访问 <Text code>https://open.bigmodel.cn</Text> 注册账号并获取API密钥<br/>
            <Text strong>2. 模型选择：</Text> 推荐使用 <Text code>glm-4</Text> 模型，性能优秀且稳定<br/>
            <Text strong>3. 安全提示：</Text> API密钥仅存储在本地，不会上传到任何服务器
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default AIConfigPage;