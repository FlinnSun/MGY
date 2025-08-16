import React, { useState, useEffect } from 'react';
import {
  Card, 
  Button, 
  Rate, 
  TimePicker, 
  Input, 
  Row, 
  Col,
  Typography,
  Space,
  message,
  Statistic,
  Progress,
  Alert,
  Tabs,
  List,
  Switch,
  Slider,
  Tag,
  Divider,
  Avatar,
  Upload,
  Popconfirm,
  Empty
} from 'antd';
import {
  MoonOutlined,
  SunOutlined,
  ClockCircleOutlined,
  StarOutlined,
  HeartOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RestOutlined,
  RiseOutlined,
  CalendarOutlined,
  BulbOutlined,
  SoundOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CoffeeOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  AudioOutlined,
  HeartFilled
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

function SleepPage() {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [bedtime, setBedtime] = useState(dayjs('22:00', 'HH:mm'));
  const [wakeTime, setWakeTime] = useState(dayjs('07:00', 'HH:mm'));
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepNotes, setSleepNotes] = useState('');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [selectedSound, setSelectedSound] = useState('rain');
  const [soundVolume, setSoundVolume] = useState(50);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(dayjs('21:30', 'HH:mm'));
  const [activeTab, setActiveTab] = useState('record');
  const [userAudios, setUserAudios] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [favoriteAudios, setFavoriteAudios] = useState([]);
  const [sleepStats, setSleepStats] = useState({
    averageDuration: 0,
    averageQuality: 0,
    totalRecords: 0,
    weeklyTrend: 0,
    sleepEfficiency: 0,
    recommendedBedtime: '',
    streakDays: 0
  });

  useEffect(() => {
    loadSleepRecords();
    loadUserAudios();
  }, []);

  useEffect(() => {
    calculateSleepStats();
  }, [sleepRecords]);

  useEffect(() => {
    // 清理音频播放器
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
      }
    };
  }, [audioPlayer]);

  const calculateSleepStats = () => {
    if (sleepRecords.length === 0) {
      setSleepStats({
        averageDuration: 0,
        averageQuality: 0,
        totalRecords: 0,
        weeklyTrend: 0,
        sleepEfficiency: 0,
        recommendedBedtime: '',
        streakDays: 0
      });
      return;
    }

    const totalRecords = sleepRecords.length;
    const averageDuration = sleepRecords.reduce((sum, record) => sum + record.duration, 0) / totalRecords;
    const averageQuality = sleepRecords.reduce((sum, record) => sum + record.quality_score, 0) / totalRecords;
    
    // 计算睡眠效率 (质量 * 时长的综合评分)
    const sleepEfficiency = (averageQuality / 5) * Math.min(averageDuration / 8, 1) * 100;
    
    // 计算最近7天的趋势
    const recentRecords = sleepRecords
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
      const firstAvg = firstHalf.reduce((sum, r) => sum + r.quality_score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.quality_score, 0) / secondHalf.length;
      weeklyTrend = ((secondAvg - firstAvg) / firstAvg) * 100;
    }

    // 推荐就寝时间 (基于平均睡眠时长)
    const idealSleepHours = 8;
    const wakeUpTime = 7; // 假设7点起床
    const recommendedBedtime = `${(24 + wakeUpTime - idealSleepHours) % 24}:00`;

    // 计算连续记录天数
    const sortedRecords = [...sleepRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
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

    setSleepStats({
      averageDuration: Math.round(averageDuration * 10) / 10,
      averageQuality: Math.round(averageQuality * 10) / 10,
      totalRecords,
      weeklyTrend: Math.round(weeklyTrend * 10) / 10,
      sleepEfficiency: Math.round(sleepEfficiency),
      recommendedBedtime,
      streakDays
    });
  };

  const loadSleepRecords = async () => {
    try {
      // 模拟数据
      const mockRecords = [
        {
          id: '1',
          bedtime: '22:30',
          wake_time: '07:00',
          quality_score: 4,
          notes: '睡眠质量不错，使用了白噪音',
          date: dayjs().format('YYYY-MM-DD'),
          duration: 8.5
        },
        {
          id: '2',
          bedtime: '23:00',
          wake_time: '07:30',
          quality_score: 3,
          notes: '有点难入睡',
          date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
          duration: 8.5
        },
        {
          id: '3',
          bedtime: '22:00',
          wake_time: '06:30',
          quality_score: 5,
          notes: '睡得很好，精神饱满',
          date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
          duration: 8.5
        },
        {
          id: '4',
          bedtime: '23:30',
          wake_time: '07:00',
          quality_score: 2,
          notes: '睡前看了手机，影响睡眠',
          date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
          duration: 7.5
        },
        {
          id: '5',
          bedtime: '22:15',
          wake_time: '06:45',
          quality_score: 4,
          notes: '听了轻音乐，帮助入睡',
          date: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
          duration: 8.5
        },
        {
          id: '6',
          bedtime: '22:45',
          wake_time: '07:15',
          quality_score: 3,
          notes: '普通的睡眠',
          date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
          duration: 8.5
        },
        {
          id: '7',
          bedtime: '21:45',
          wake_time: '06:30',
          quality_score: 5,
          notes: '早睡早起，感觉很好',
          date: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
          duration: 8.75
        }
      ];
      setSleepRecords(mockRecords);
    } catch (error) {
      message.error('加载睡眠记录失败');
    }
  };

  const handleSaveSleepRecord = async () => {
    try {
      const duration = calculateSleepDuration(bedtime, wakeTime);
      const newRecord = {
        id: Date.now().toString(),
        bedtime: bedtime.format('HH:mm'),
        wake_time: wakeTime.format('HH:mm'),
        quality_score: sleepQuality,
        notes: sleepNotes,
        date: dayjs().format('YYYY-MM-DD'),
        duration: duration
      };

      setSleepRecords(prev => [newRecord, ...prev]);
      message.success('睡眠记录保存成功');
      
      // 重置表单
      setSleepNotes('');
      setSleepQuality(3);
      
    } catch (error) {
      message.error('保存失败');
    }
  };

  const calculateSleepDuration = (bedtime, wakeTime) => {
    let duration = wakeTime.diff(bedtime, 'hour', true);
    if (duration < 0) {
      duration += 24; // 跨天计算
    }
    return Math.round(duration * 10) / 10;
  };

  const getQualityText = (score) => {
    if (score >= 5) return '非常好';
    if (score >= 4) return '好';
    if (score >= 3) return '一般';
    if (score >= 2) return '不好';
    return '很不好';
  };

  const getQualityColor = (score) => {
    if (score >= 5) return '#52c41a';
    if (score >= 4) return '#73d13d';
    if (score >= 3) return '#faad14';
    if (score >= 2) return '#ff7875';
    return '#ff4d4f';
  };

  const getSleepIcon = (quality) => {
    if (quality >= 4) return <StarOutlined style={{ color: '#52c41a' }} />;
    if (quality >= 3) return <MoonOutlined style={{ color: '#faad14' }} />;
    return <ClockCircleOutlined style={{ color: '#f5222d' }} />;
  };

  // 计算睡眠统计
  const getSleepStats = () => {
    if (sleepRecords.length === 0) return { avgQuality: 0, avgDuration: 0, goodNights: 0 };
    
    const recent7Days = sleepRecords.slice(0, 7);
    const avgQuality = recent7Days.reduce((sum, record) => sum + record.quality_score, 0) / recent7Days.length;
    const avgDuration = recent7Days.reduce((sum, record) => sum + record.duration, 0) / recent7Days.length;
    const goodNights = recent7Days.filter(record => record.quality_score >= 4).length;
    
    return { 
      avgQuality: avgQuality.toFixed(1), 
      avgDuration: avgDuration.toFixed(1), 
      goodNights 
    };
  };

  const stats = getSleepStats();

  // 准备图表数据
  const chartData = sleepRecords
    .slice(0, 14)
    .reverse()
    .map(record => ({
      date: dayjs(record.date).format('MM/DD'),
      quality: record.quality_score,
      duration: record.duration
    }));

  const sounds = [
    { key: 'rain', name: '雨声', icon: '🌧️' },
    { key: 'ocean', name: '海浪声', icon: '🌊' },
    { key: 'forest', name: '森林声', icon: '🌲' },
    { key: 'piano', name: '轻柔钢琴', icon: '🎹' },
    { key: 'meditation', name: '冥想音乐', icon: '🧘' },
    { key: 'lullaby', name: '摇篮曲', icon: '🎵' }
  ];

  const sleepTips = [
    '保持规律的睡眠时间',
    '睡前1小时避免使用电子设备',
    '创造舒适的睡眠环境',
    '避免睡前大量进食',
    '适当的运动有助于睡眠',
    '保持卧室温度适宜（18-22°C）',
    '使用遮光窗帘',
    '睡前可以做一些放松活动'
  ];

  const dietSuggestions = {
    morning: [
      '一杯温水开始新的一天',
      '富含蛋白质的早餐（鸡蛋、牛奶）',
      '适量的复合碳水化合物（燕麦、全麦面包）',
      '新鲜水果补充维生素'
    ],
    afternoon: [
      '午餐后适当休息15-20分钟',
      '避免过量咖啡因',
      '多喝水保持水分',
      '下午茶可以选择坚果或酸奶'
    ],
    evening: [
      '晚餐清淡，避免油腻食物',
      '睡前2小时停止进食',
      '可以喝一杯温牛奶或花茶',
      '避免酒精和咖啡因'
    ]
  };

  // 加载用户音频列表
  const loadUserAudios = () => {
    try {
      const savedAudios = localStorage.getItem('userAudios');
      const savedFavorites = localStorage.getItem('favoriteAudios');
      if (savedAudios) {
        setUserAudios(JSON.parse(savedAudios));
      }
      if (savedFavorites) {
        setFavoriteAudios(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('加载用户音频失败:', error);
    }
  };

  // 保存用户音频到本地存储
  const saveUserAudios = (audios) => {
    try {
      localStorage.setItem('userAudios', JSON.stringify(audios));
      setUserAudios(audios);
    } catch (error) {
      console.error('保存用户音频失败:', error);
      message.error('保存音频失败');
    }
  };

  // 处理音频文件上传
  const handleAudioUpload = (file) => {
    const isAudio = file.type.startsWith('audio/');
    if (!isAudio) {
      message.error('请上传音频文件！');
      return false;
    }

    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('音频文件大小不能超过50MB！');
      return false;
    }

    // 创建音频URL
    const audioUrl = URL.createObjectURL(file);
    const newAudio = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
      originalName: file.name,
      url: audioUrl,
      file: file,
      uploadTime: new Date().toISOString(),
      duration: 0,
      type: 'user'
    };

    // 获取音频时长
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      newAudio.duration = audio.duration;
      const updatedAudios = [...userAudios, newAudio];
      saveUserAudios(updatedAudios);
      message.success('音频上传成功！');
    });

    return false; // 阻止默认上传行为
  };

  // 删除用户音频
  const deleteUserAudio = (audioId) => {
    const updatedAudios = userAudios.filter(audio => audio.id !== audioId);
    saveUserAudios(updatedAudios);
    
    // 如果正在播放被删除的音频，停止播放
    if (currentAudio && currentAudio.id === audioId) {
      stopAudio();
    }
    
    // 从收藏列表中移除
    const updatedFavorites = favoriteAudios.filter(id => id !== audioId);
    setFavoriteAudios(updatedFavorites);
    localStorage.setItem('favoriteAudios', JSON.stringify(updatedFavorites));
    
    message.success('音频删除成功');
  };

  // 播放音频
  const playAudio = (audio) => {
    try {
      // 停止当前播放
      if (audioPlayer) {
        audioPlayer.pause();
      }

      let audioUrl;
      if (audio.type === 'user') {
        audioUrl = audio.url;
      } else {
        // 预设音频的模拟URL（实际项目中应该是真实的音频文件）
        audioUrl = `/sounds/${audio.key}.mp3`;
      }

      const player = new Audio(audioUrl);
      player.volume = soundVolume / 100;
      player.loop = isLooping;
      
      player.addEventListener('loadedmetadata', () => {
        setAudioDuration(player.duration);
      });
      
      player.addEventListener('timeupdate', () => {
        setPlaybackTime(player.currentTime);
      });
      
      player.addEventListener('ended', () => {
        if (!isLooping) {
          setIsPlayingSound(false);
          setCurrentAudio(null);
          setPlaybackTime(0);
        }
      });
      
      player.addEventListener('error', (e) => {
        console.error('音频播放错误:', e);
        message.error('音频播放失败');
        setIsPlayingSound(false);
        setCurrentAudio(null);
      });

      player.play().then(() => {
        setAudioPlayer(player);
        setCurrentAudio(audio);
        setIsPlayingSound(true);
        message.success(`开始播放：${audio.name}`);
      }).catch((error) => {
        console.error('播放失败:', error);
        message.error('播放失败，请检查音频文件');
      });
    } catch (error) {
      console.error('播放音频时出错:', error);
      message.error('播放失败');
    }
  };

  // 停止音频播放
  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
    setIsPlayingSound(false);
    setCurrentAudio(null);
    setPlaybackTime(0);
    message.info('停止播放');
  };

  // 暂停/恢复播放
  const togglePlayPause = () => {
    if (!audioPlayer) return;
    
    if (isPlayingSound) {
      audioPlayer.pause();
      setIsPlayingSound(false);
    } else {
      audioPlayer.play();
      setIsPlayingSound(true);
    }
  };

  // 调整播放进度
  const seekAudio = (value) => {
    if (audioPlayer && audioDuration > 0) {
      const newTime = (value / 100) * audioDuration;
      audioPlayer.currentTime = newTime;
      setPlaybackTime(newTime);
    }
  };

  // 切换收藏状态
  const toggleFavorite = (audioId) => {
    const updatedFavorites = favoriteAudios.includes(audioId)
      ? favoriteAudios.filter(id => id !== audioId)
      : [...favoriteAudios, audioId];
    
    setFavoriteAudios(updatedFavorites);
    localStorage.setItem('favoriteAudios', JSON.stringify(updatedFavorites));
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSound = () => {
    // 如果有选中的预设音频，播放预设音频
    if (selectedSound && sounds.find(s => s.key === selectedSound)) {
      const sound = sounds.find(s => s.key === selectedSound);
      if (!isPlayingSound) {
        playAudio({ ...sound, type: 'preset' });
      } else {
        stopAudio();
      }
    }
  };

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <MoonOutlined style={{ color: '#722ed1', marginRight: 8 }} />
          睡眠助手
        </Title>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<><ClockCircleOutlined /> 睡眠记录</>} key="record">
          <Row gutter={[16, 16]}>
            {/* 记录睡眠 */}
            <Col xs={24} lg={12}>
              <Card title="记录今日睡眠" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div>
                        <Text strong>就寝时间：</Text>
                        <TimePicker
                          value={bedtime}
                          onChange={setBedtime}
                          format="HH:mm"
                          style={{ width: '100%', marginTop: 8 }}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <Text strong>起床时间：</Text>
                        <TimePicker
                          value={wakeTime}
                          onChange={setWakeTime}
                          format="HH:mm"
                          style={{ width: '100%', marginTop: 8 }}
                        />
                      </div>
                    </Col>
                  </Row>
                  
                  <div>
                    <Text strong>睡眠时长：</Text>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 8 }}>
                      {calculateSleepDuration(bedtime, wakeTime)} 小时
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <Text strong>睡眠质量：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Rate 
                        value={sleepQuality} 
                        onChange={setSleepQuality}
                        character={<MoonOutlined />}
                        style={{ fontSize: 24 }}
                      />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 'bold', color: getQualityColor(sleepQuality) }}>
                      {getQualityText(sleepQuality)}
                    </div>
                  </div>
                  
                  <div>
                    <Text strong>睡眠备注：</Text>
                    <TextArea
                      value={sleepNotes}
                      onChange={(e) => setSleepNotes(e.target.value)}
                      placeholder="记录影响睡眠的因素、梦境或其他感受..."
                      rows={3}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                  
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    onClick={handleSaveSleepRecord}
                  >
                    保存睡眠记录
                  </Button>
                </Space>
              </Card>
            </Col>
            
            {/* 睡眠统计 */}
            <Col xs={24} lg={12}>
              <Card title="睡眠统计（最近7天）" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="平均质量"
                      value={stats.avgQuality}
                      suffix="/ 5"
                      valueStyle={{ color: getQualityColor(parseFloat(stats.avgQuality)) }}
                      prefix={<MoonOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="平均时长"
                      value={stats.avgDuration}
                      suffix="小时"
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="优质睡眠"
                      value={stats.goodNights}
                      suffix="/ 7天"
                      valueStyle={{ color: '#52c41a' }}
                      prefix={<HeartOutlined />}
                    />
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" hoverable>
                      <Statistic
                        title="睡眠效率"
                        value={sleepStats.sleepEfficiency}
                        suffix="%"
                        valueStyle={{ color: sleepStats.sleepEfficiency >= 80 ? '#52c41a' : sleepStats.sleepEfficiency >= 60 ? '#faad14' : '#f5222d' }}
                        prefix={<RiseOutlined style={{ 
                          color: sleepStats.sleepEfficiency >= 80 ? '#52c41a' : sleepStats.sleepEfficiency >= 60 ? '#faad14' : '#f5222d'
                        }} />}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" hoverable>
                      <Statistic
                        title="连续记录"
                        value={sleepStats.streakDays}
                        suffix="天"
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                      />
                    </Card>
                  </Col>
                </Row>
                
                <div style={{ marginTop: 24 }}>
                  <Text strong>睡眠质量趋势</Text>
                  <div style={{ height: 200, marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} />
                        <RechartsTooltip 
                          formatter={(value, name) => [
                            name === 'quality' ? getQualityText(value) : `${value}小时`,
                            name === 'quality' ? '睡眠质量' : '睡眠时长'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="quality" 
                          stroke="#722ed1" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          
          {/* 历史记录 */}
          <Card title="睡眠历史">
            <List
              dataSource={sleepRecords.slice(0, 10)}
              renderItem={(record) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{dayjs(record.date).format('MM月DD日')}</Text>
                        <Tag color={getQualityColor(record.quality_score)}>
                          {getQualityText(record.quality_score)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Space size="large">
                          <Text>🛏️ {record.bedtime} - 🌅 {record.wake_time}</Text>
                          <Text>⏰ {record.duration}小时</Text>
                        </Space>
                        {record.notes && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary">{record.notes}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          
          {/* 睡眠分析和建议 */}
          <Card title={<><BulbOutlined /> 睡眠分析与建议</>} style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ marginBottom: 16 }}>
                    <Avatar 
                      size={64} 
                      style={{ 
                        backgroundColor: getQualityColor(sleepStats.averageQuality),
                        fontSize: '24px'
                      }}
                    >
                      {getSleepIcon(sleepStats.averageQuality)}
                    </Avatar>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 8 }}>
                    睡眠质量: {getQualityText(sleepStats.averageQuality)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: 16 }}>
                    推荐就寝时间: {sleepStats.recommendedBedtime}
                  </div>
                  <Progress
                    percent={sleepStats.sleepEfficiency}
                    strokeColor={{
                      '0%': '#f5222d',
                      '60%': '#faad14',
                      '80%': '#52c41a',
                    }}
                    format={() => `${sleepStats.sleepEfficiency}%`}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ padding: '20px 0' }}>
                  {sleepStats.averageQuality >= 4 ? (
                    <Alert
                      message="睡眠质量很好！"
                      description={
                        <div>
                          <div>继续保持良好的睡眠习惯：</div>
                          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                            <li>保持规律的作息时间</li>
                            <li>睡前避免使用电子设备</li>
                            <li>保持卧室环境舒适</li>
                          </ul>
                        </div>
                      }
                      type="success"
                      showIcon
                    />
                  ) : sleepStats.averageQuality >= 3 ? (
                    <Alert
                      message="睡眠质量还不错"
                      description={
                        <div>
                          <div>可以通过以下方式改善：</div>
                          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                            <li>建立睡前放松routine</li>
                            <li>控制咖啡因摄入时间</li>
                            <li>增加白天运动量</li>
                          </ul>
                        </div>
                      }
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Alert
                      message="需要改善睡眠质量"
                      description={
                        <div>
                          <div>建议采取以下措施：</div>
                          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                            <li>调整睡眠环境</li>
                            <li>寻求专业医生建议</li>
                            <li>考虑睡眠监测设备</li>
                          </ul>
                        </div>
                      }
                      type="error"
                      showIcon
                    />
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </TabPane>
        
        <TabPane tab={<><SoundOutlined /> 助眠功能</>} key="sounds">
          <Row gutter={[16, 16]}>
            {/* 预设音频 */}
            <Col xs={24} lg={12}>
              <Card title="预设助眠音频">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text strong>选择助眠声音：</Text>
                    <div style={{ marginTop: 16 }}>
                      <Row gutter={[8, 8]}>
                        {sounds.map(sound => (
                          <Col span={8} key={sound.key}>
                            <Button
                              type={selectedSound === sound.key && currentAudio?.key === sound.key ? 'primary' : 'default'}
                              block
                              onClick={() => {
                                setSelectedSound(sound.key);
                                playAudio({ ...sound, type: 'preset' });
                              }}
                              style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <div style={{ fontSize: 20 }}>{sound.icon}</div>
                              <div style={{ fontSize: 12 }}>{sound.name}</div>
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
            
            {/* 用户音频库 */}
            <Col xs={24} lg={12}>
              <Card 
                title="我的音频库" 
                extra={
                  <Upload
                    beforeUpload={handleAudioUpload}
                    showUploadList={false}
                    accept="audio/*"
                  >
                    <Button icon={<UploadOutlined />} type="primary">
                      上传音频
                    </Button>
                  </Upload>
                }
              >
                {userAudios.length === 0 ? (
                  <Empty 
                    description="暂无音频文件"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Upload
                      beforeUpload={handleAudioUpload}
                      showUploadList={false}
                      accept="audio/*"
                    >
                      <Button type="primary" icon={<CloudUploadOutlined />}>
                        上传第一个音频
                      </Button>
                    </Upload>
                  </Empty>
                ) : (
                  <List
                    size="small"
                    dataSource={userAudios}
                    renderItem={(audio) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            icon={favoriteAudios.includes(audio.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                            onClick={() => toggleFavorite(audio.id)}
                          />,
                          <Button
                            type="text"
                            icon={currentAudio?.id === audio.id && isPlayingSound ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={() => {
                              if (currentAudio?.id === audio.id && isPlayingSound) {
                                togglePlayPause();
                              } else {
                                playAudio(audio);
                              }
                            }}
                          />,
                          <Popconfirm
                            title="确定删除这个音频吗？"
                            onConfirm={() => deleteUserAudio(audio.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="text" icon={<DeleteOutlined />} danger />
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                           avatar={<AudioOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{audio.name}</span>
                              {currentAudio?.id === audio.id && (
                                <Tag color="blue" size="small">播放中</Tag>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                时长: {audio.duration > 0 ? formatTime(audio.duration) : '未知'}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                上传时间: {dayjs(audio.uploadTime).format('MM-DD HH:mm')}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            
            {/* 播放控制器 */}
            <Col xs={24}>
              <Card title="播放控制">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {currentAudio && (
                    <Alert
                      message={`正在播放：${currentAudio.name}`}
                      type="info"
                      showIcon
                      action={
                        <Button size="small" onClick={stopAudio}>
                          停止
                        </Button>
                      }
                    />
                  )}
                  
                  <div>
                    <Text strong>音量控制：</Text>
                    <Slider
                      value={soundVolume}
                      onChange={(value) => {
                        setSoundVolume(value);
                        if (audioPlayer) {
                          audioPlayer.volume = value / 100;
                        }
                      }}
                      style={{ marginTop: 8 }}
                      marks={{
                        0: '静音',
                        50: '适中',
                        100: '最大'
                      }}
                    />
                  </div>
                  
                  {audioDuration > 0 && (
                    <div>
                      <Text strong>播放进度：</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <Text style={{ minWidth: 40, fontSize: 12 }}>{formatTime(playbackTime)}</Text>
                        <Slider
                          value={audioDuration > 0 ? (playbackTime / audioDuration) * 100 : 0}
                          onChange={seekAudio}
                          style={{ flex: 1 }}
                          tooltip={{ formatter: null }}
                        />
                        <Text style={{ minWidth: 40, fontSize: 12 }}>{formatTime(audioDuration)}</Text>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={isPlayingSound ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={togglePlayPause}
                      disabled={!currentAudio}
                    >
                      {isPlayingSound ? '暂停' : '播放'}
                    </Button>
                    
                    <Button
                      size="large"
                      onClick={stopAudio}
                      disabled={!currentAudio}
                    >
                      停止
                    </Button>
                    
                    <Button
                      size="large"
                      type={isLooping ? 'primary' : 'default'}
                      onClick={() => {
                        setIsLooping(!isLooping);
                        if (audioPlayer) {
                          audioPlayer.loop = !isLooping;
                        }
                      }}
                    >
                      {isLooping ? '循环开' : '循环关'}
                    </Button>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="睡眠提醒设置">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Space>
                      <Switch
                        checked={reminderEnabled}
                        onChange={setReminderEnabled}
                      />
                      <Text strong>启用睡眠提醒</Text>
                    </Space>
                  </div>
                  
                  {reminderEnabled && (
                    <div>
                      <Text strong>提醒时间：</Text>
                      <TimePicker
                        value={reminderTime}
                        onChange={setReminderTime}
                        format="HH:mm"
                        style={{ width: '100%', marginTop: 8 }}
                      />
                      <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        系统会在设定时间提醒您准备睡觉
                      </Text>
                    </div>
                  )}
                  
                  <Alert
                    message="睡眠小贴士"
                    description="建议在睡前30分钟开始放松活动，如听轻音乐、阅读或冥想。"
                    type="info"
                    showIcon
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab={<><CoffeeOutlined /> 作息建议</>} key="lifestyle">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title={<><SunOutlined /> 晨间建议</>}>
                <List
                  size="small"
                  dataSource={dietSuggestions.morning}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title={<><ThunderboltOutlined /> 午间建议</>}>
                <List
                  size="small"
                  dataSource={dietSuggestions.afternoon}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title={<><MoonOutlined /> 晚间建议</>}>
                <List
                  size="small"
                  dataSource={dietSuggestions.evening}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
          
          <Card title={<><RestOutlined /> 睡眠改善建议</>} style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              {sleepTips.map((tip, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card size="small" style={{ height: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>💡</div>
                    <Text>{tip}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default SleepPage;