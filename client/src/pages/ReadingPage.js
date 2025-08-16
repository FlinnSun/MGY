import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  Select, 
  Slider, 
  Switch, 
  Typography, 
  Space, 
  Row, 
  Col,
  Input,
  message,
  Tooltip,
  Progress,
  Divider
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  HighlightOutlined,
  FontSizeOutlined,
  ReloadOutlined,
  BookOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';


const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function ReadingPage({ settings }) {
  const [content, setContent] = useState('');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1000);
  const [highlightMode, setHighlightMode] = useState('sentence');
  const [showNumbers, setShowNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [sentences, setSentences] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [customText, setCustomText] = useState('');
  const [selectedContent, setSelectedContent] = useState('sample');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [readingTime, setReadingTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [textComplexity, setTextComplexity] = useState('original'); // original, simple, simplified
  const [processedSentences, setProcessedSentences] = useState([]);
  const [fontFamily, setFontFamily] = useState('default'); // 字体选择
  const [fontWeight, setFontWeight] = useState('normal'); // 字体粗细
  const [letterSpacing, setLetterSpacing] = useState(0.5); // 字符间距
  const [lineHeight, setLineHeight] = useState(1.8); // 行高
  const [highlightStyle, setHighlightStyle] = useState('background'); // 高亮样式
  const [keywordHighlight, setKeywordHighlight] = useState(true); // 关键词高亮
  const [highlightIntensity, setHighlightIntensity] = useState(0.3); // 高亮强度
  
  const intervalRef = useRef(null);
  const speechRef = useRef(null);

  // 示例文本
  const sampleTexts = {
    sample: {
      title: '科学小故事：蝴蝶的奇妙旅程',
      content: '春天来了，花园里开满了五颜六色的花朵。一只小蝴蝶从茧中钻了出来，它有着美丽的翅膀。小蝴蝶第一次看到这个世界，感到非常好奇。它飞到一朵红色的玫瑰花上，轻轻地吸着花蜜。玫瑰花告诉它："欢迎来到这个美丽的世界！"小蝴蝶又飞到了向日葵上，向日葵说："你可以帮助我们传播花粉呢！"小蝴蝶很高兴能够帮助花朵们。从那天起，它每天都在花园里快乐地飞舞，成为了花朵们最好的朋友。'
    },
    story: {
      title: '友谊的力量',
      content: '小明和小红是同班同学。小明有阅读困难，每次看书都很吃力。小红发现了这个问题，决定帮助他。她每天放学后都陪小明一起读书。小红会把长句子分成短句子，用不同的颜色标记重要的词语。慢慢地，小明的阅读能力提高了。他们的友谊也变得更加深厚。这个故事告诉我们，朋友之间的互相帮助是多么珍贵。'
    },
    science: {
      title: '神奇的大脑',
      content: '人类的大脑是一个非常神奇的器官。它由数十亿个神经元组成。每个神经元都像一个小小的电脑。当我们学习新知识时，神经元之间会建立新的连接。这就像在大脑里修建新的道路。练习得越多，这些道路就越宽阔。所以，不要害怕学习困难，每一次努力都在让我们的大脑变得更强大。'
    }
  };

  useEffect(() => {
    if (selectedContent !== 'custom') {
      const selected = sampleTexts[selectedContent];
      setContent(selected.content);
      processSentences(selected.content);
    }
  }, [selectedContent]);

  useEffect(() => {
    if (customText && selectedContent === 'custom') {
      setContent(customText);
      processSentences(customText);
    }
  }, [customText]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setReadingTime(time => time + 1);
      }, 1000);
    } else if (!isTimerActive && readingTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, readingTime]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const processSentences = (text) => {
    // 简单的句子分割
    const sentenceArray = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    setSentences(sentenceArray);
    
    // 处理不同复杂度的文本
    const processed = processTextComplexity(sentenceArray, textComplexity);
    setProcessedSentences(processed);
    
    setCurrentSentence(0);
    setReadingProgress(0);
  };

  // 文本复杂度处理函数
  const processTextComplexity = (sentences, complexity) => {
    return sentences.map(sentence => {
      const original = sentence.trim();
      let simple = original;
      let simplified = original;
      
      if (complexity === 'simple' || complexity === 'simplified') {
        // 简化处理：替换复杂词汇，缩短句子
        simple = simplifyText(original);
      }
      
      if (complexity === 'simplified') {
        // 进一步简化：分解长句，使用更简单的词汇
        simplified = furtherSimplifyText(simple);
      }
      
      return {
        original,
        simple,
        simplified,
        complexity: analyzeComplexity(original)
      };
    });
  };

  // 简化文本函数
  const simplifyText = (text) => {
    const complexWords = {
      '非常': '很',
      '特别': '很',
      '极其': '很',
      '相当': '很',
      '十分': '很',
      '异常': '很',
      '格外': '很',
      '尤其': '特别',
      '因此': '所以',
      '然而': '但是',
      '不过': '但是',
      '况且': '而且',
      '并且': '而且',
      '以及': '和',
      '或者': '或',
      '倘若': '如果',
      '假如': '如果',
      '倘使': '如果',
      '假设': '如果',
      '尽管': '虽然',
      '即使': '就算',
      '纵然': '就算',
      '即便': '就算'
    };
    
    let simplified = text;
    Object.keys(complexWords).forEach(complex => {
      const simple = complexWords[complex];
      simplified = simplified.replace(new RegExp(complex, 'g'), simple);
    });
    
    return simplified;
  };

  // 进一步简化文本函数
  const furtherSimplifyText = (text) => {
    // 分解长句子
    if (text.length > 20) {
      // 在连词处分割
      const connectors = ['，', '、', '和', '与', '及', '以及', '并且', '而且', '但是', '不过', '然而', '所以', '因此'];
      for (let connector of connectors) {
        if (text.includes(connector)) {
          const parts = text.split(connector);
          if (parts.length > 1 && parts[0].length > 8) {
            return parts[0].trim() + '。' + parts.slice(1).join(connector);
          }
        }
      }
    }
    
    return text;
  };

  // 分析文本复杂度
  const analyzeComplexity = (text) => {
    let score = 0;
    
    // 长度评分
    if (text.length > 30) score += 3;
    else if (text.length > 20) score += 2;
    else if (text.length > 10) score += 1;
    
    // 复杂词汇评分
    const complexPatterns = [
      /[非特极相十异格尤]/,  // 程度副词
      /[因然不况并以或倘假尽即纵]/,  // 连词
      /[之乎者也]/,  // 文言词
      /[、，；：]/  // 标点符号
    ];
    
    complexPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 1;
    });
    
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  };

  // 识别关键词和重点内容
  const identifyKeywords = (text) => {
    const keywords = {
      // 重要概念词
      concepts: ['科学', '研究', '发现', '理论', '方法', '技术', '创新', '发明'],
      // 情感词汇
      emotions: ['高兴', '快乐', '悲伤', '愤怒', '惊讶', '害怕', '喜欢', '讨厌'],
      // 动作词
      actions: ['学习', '思考', '观察', '实验', '分析', '总结', '应用', '创造'],
      // 时间词
      time: ['今天', '昨天', '明天', '现在', '过去', '未来', '早上', '晚上'],
      // 数量词
      numbers: /\d+|一|二|三|四|五|六|七|八|九|十|百|千|万/g
    };
    
    const foundKeywords = [];
    
    // 检查各类关键词
    Object.keys(keywords).forEach(category => {
      if (category === 'numbers') {
        const matches = text.match(keywords[category]);
        if (matches) {
          matches.forEach(match => {
            foundKeywords.push({ word: match, category, importance: 'medium' });
          });
        }
      } else {
        keywords[category].forEach(word => {
          if (text.includes(word)) {
            foundKeywords.push({ word, category, importance: 'high' });
          }
        });
      }
    });
    
    return foundKeywords;
  };

  // 获取高亮样式
  const getHighlightStyles = (isActive, isRead, keywords = []) => {
    const baseStyle = {
      padding: '8px 12px',
      margin: '8px 0',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    };
    
    if (isActive) {
      switch (highlightStyle) {
        case 'background':
          return {
            ...baseStyle,
            backgroundColor: `rgba(255, 193, 7, ${highlightIntensity})`,
            border: '2px solid #ffc107'
          };
        case 'underline':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderBottom: '3px solid #ffc107',
            boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)'
          };
        case 'border':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            border: '2px solid #ffc107',
            boxShadow: '0 0 8px rgba(255, 193, 7, 0.4)'
          };
        case 'glow':
          return {
            ...baseStyle,
            backgroundColor: `rgba(255, 193, 7, ${highlightIntensity * 0.5})`,
            boxShadow: `0 0 12px rgba(255, 193, 7, ${highlightIntensity})`,
            border: '1px solid rgba(255, 193, 7, 0.6)'
          };
        default:
          return {
            ...baseStyle,
            backgroundColor: `rgba(255, 193, 7, ${highlightIntensity})`,
            border: '2px solid #ffc107'
          };
      }
    } else if (isRead) {
      return {
        ...baseStyle,
        backgroundColor: `rgba(212, 237, 218, ${highlightIntensity * 0.8})`,
        border: '1px solid transparent'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        border: '1px solid transparent'
      };
    }
  };

  // 当复杂度设置改变时重新处理文本
  useEffect(() => {
    if (sentences.length > 0) {
      const processed = processTextComplexity(sentences, textComplexity);
      setProcessedSentences(processed);
    }
  }, [textComplexity, sentences]);

  const startReading = () => {
    if (sentences.length === 0) return;
    
    setIsPlaying(true);
    setIsTimerActive(true);
    intervalRef.current = setInterval(() => {
      setCurrentSentence(prev => {
        const next = prev + 1;
        if (next >= sentences.length) {
          setIsPlaying(false);
          setIsTimerActive(false);
          setReadingProgress(100);
          clearInterval(intervalRef.current);
          message.success('阅读完成！');
          return prev;
        }
        setReadingProgress((next / sentences.length) * 100);
        return next;
      });
    }, readingSpeed);
  };

  const pauseReading = () => {
    setIsPlaying(false);
    setIsTimerActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetReading = () => {
    setIsPlaying(false);
    setIsTimerActive(false);
    setCurrentSentence(0);
    setReadingProgress(0);
    setReadingTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (speechRef.current) {
      speechSynthesis.cancel();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = (text) => {
    if (!settings.speechEnabled) {
      message.warning('语音功能已关闭');
      return;
    }

    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      speechRef.current = utterance;
    };
    
    utterance.onend = () => {
      speechRef.current = null;
    };
    
    speechSynthesis.speak(utterance);
  };

  const renderContent = () => {
    if (sentences.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <BookOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>请选择或输入要阅读的内容</div>
        </div>
      );
    }

    const getComplexityColor = (complexity) => {
      switch (complexity) {
        case 'high': return '#ff4d4f';
        case 'medium': return '#faad14';
        case 'low': return '#52c41a';
        default: return '#d9d9d9';
      }
    };

    const getComplexityLabel = (complexity) => {
      switch (complexity) {
        case 'high': return '复杂';
        case 'medium': return '中等';
        case 'low': return '简单';
        default: return '未知';
      }
    };

    // 获取字体样式
    const getFontFamily = () => {
      const fontMap = {
        'default': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'serif': 'Georgia, "Times New Roman", Times, serif',
        'dyslexic': '"OpenDyslexic", "Comic Sans MS", cursive',
        'mono': '"Courier New", Courier, monospace',
        'chinese': '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif',
        'reading': '"Noto Sans", "Source Sans Pro", "Helvetica Neue", Arial, sans-serif',
        'large-print': '"Arial Black", Arial, sans-serif'
      };
      return fontMap[fontFamily] || fontMap['default'];
    };

    return (
      <div 
        className={`reading-content ${showNumbers ? 'numbered-paragraphs' : ''}`}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          letterSpacing: `${letterSpacing}px`,
          wordSpacing: '2px',
          fontFamily: getFontFamily(),
          fontWeight: fontWeight
        }}
      >
        {(processedSentences.length > 0 ? processedSentences : sentences.map(s => ({ original: s, simple: s, simplified: s, complexity: 'medium' }))).map((sentenceData, index) => {
          const isActive = index === currentSentence;
          const isRead = index < currentSentence;
          
          // 根据复杂度设置选择显示的文本
          let displayText = sentenceData.original;
          if (textComplexity === 'simple') {
            displayText = sentenceData.simple || sentenceData.original;
          } else if (textComplexity === 'simplified') {
            displayText = sentenceData.simplified || sentenceData.simple || sentenceData.original;
          }
          
          // 识别关键词
          const keywords = keywordHighlight ? identifyKeywords(displayText) : [];
          
          return (
            <div
              key={index}
              className={`
                ${showNumbers ? 'numbered-paragraph' : ''}
                ${isActive ? 'highlight-sentence' : ''}
                ${isRead ? 'read-sentence' : ''}
              `}
              style={getHighlightStyles(isActive, isRead, keywords)}
              onClick={() => {
                setCurrentSentence(index);
                speakText(displayText);
              }}
            >
              {/* 复杂度指示器 */}
              {textComplexity === 'original' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getComplexityColor(sentenceData.complexity),
                    title: `复杂度: ${getComplexityLabel(sentenceData.complexity)}`
                  }}
                />
              )}
              
              {/* 渲染文本内容，支持关键词高亮 */}
              {keywordHighlight && keywords.length > 0 ? (
                (() => {
                  let highlightedText = displayText;
                  keywords.forEach(({ word, category, importance }) => {
                    const colorMap = {
                      concepts: '#1890ff',
                      emotions: '#eb2f96',
                      actions: '#52c41a',
                      time: '#722ed1',
                      numbers: '#fa8c16'
                    };
                    const color = colorMap[category] || '#1890ff';
                    const regex = new RegExp(`(${word})`, 'g');
                    highlightedText = highlightedText.replace(regex, 
                      `<mark style="background-color: ${color}20; color: ${color}; font-weight: bold; padding: 1px 2px; border-radius: 2px;">$1</mark>`
                    );
                  });
                  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
                })()
              ) : highlightMode === 'word' ? (
                displayText.split('').map((char, charIndex) => (
                  <span
                    key={charIndex}
                    className={isActive && charIndex % 3 === 0 ? 'highlight-word' : ''}
                  >
                    {char}
                  </span>
                ))
              ) : (
                displayText
              )}
              
              {/* 显示原文对比 */}
              {textComplexity !== 'original' && displayText !== sentenceData.original && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    marginTop: '4px',
                    fontStyle: 'italic',
                    borderTop: '1px dashed #ddd',
                    paddingTop: '4px'
                  }}
                >
                  原文: {sentenceData.original}
                </div>
              )}
              
              {isActive && (
                <Button
                  type="text"
                  size="small"
                  icon={<SoundOutlined />}
                  style={{ marginLeft: 8, color: '#1890ff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(displayText);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-transition">
      <Title level={2}>
        <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        阅读助手
      </Title>
      
      <Row gutter={[16, 16]}>
        {/* 控制面板 */}
        <Col xs={24} lg={8}>
          <Card title={<><SettingOutlined /> 阅读设置</>} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Text strong>阅读时间: {formatTime(readingTime)}</Text>
              <Progress 
                percent={readingProgress} 
                size="small" 
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>选择内容：</Text>
                <Select
                  value={selectedContent}
                  onChange={setSelectedContent}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="sample">科学小故事</Option>
                  <Option value="story">友谊的力量</Option>
                  <Option value="science">神奇的大脑</Option>
                  <Option value="custom">自定义文本</Option>
                </Select>
              </div>
              
              {selectedContent === 'custom' && (
                <div>
                  <Text strong>自定义文本：</Text>
                  <TextArea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="请输入要阅读的文本..."
                    rows={4}
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}
              
              <div>
                <Text strong>阅读速度：</Text>
                <Slider
                  min={500}
                  max={3000}
                  step={100}
                  value={readingSpeed}
                  onChange={setReadingSpeed}
                  marks={{
                    500: '快',
                    1500: '中',
                    3000: '慢'
                  }}
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary">{readingSpeed}ms/句</Text>
              </div>
              
              <div>
                <Text strong>字体大小：</Text>
                <Slider
                  min={12}
                  max={32}
                  value={fontSize}
                  onChange={setFontSize}
                  marks={{
                    12: '小',
                    18: '中',
                    24: '大',
                    32: '特大'
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>
              
              <div>
                <Text strong>字体类型：</Text>
                <Select
                  value={fontFamily}
                  onChange={setFontFamily}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="default">默认字体</Option>
                  <Option value="chinese">中文优化</Option>
                  <Option value="reading">阅读专用</Option>
                  <Option value="dyslexic">阅读障碍友好</Option>
                  <Option value="large-print">大字体</Option>
                  <Option value="serif">衬线字体</Option>
                  <Option value="mono">等宽字体</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>字体粗细：</Text>
                <Select
                  value={fontWeight}
                  onChange={setFontWeight}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="normal">正常</Option>
                  <Option value="500">中等</Option>
                  <Option value="bold">粗体</Option>
                  <Option value="900">特粗</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>字符间距：</Text>
                <Slider
                  min={0}
                  max={3}
                  step={0.1}
                  value={letterSpacing}
                  onChange={setLetterSpacing}
                  marks={{
                    0: '紧密',
                    1.5: '正常',
                    3: '宽松'
                  }}
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary">{letterSpacing}px</Text>
              </div>
              
              <div>
                <Text strong>行高：</Text>
                <Slider
                  min={1.2}
                  max={3}
                  step={0.1}
                  value={lineHeight}
                  onChange={setLineHeight}
                  marks={{
                    1.2: '紧密',
                    1.8: '正常',
                    3: '宽松'
                  }}
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary">{lineHeight}</Text>
              </div>
              
              <div>
                <Space>
                  <Switch
                    checked={keywordHighlight}
                    onChange={setKeywordHighlight}
                  />
                  <Text>智能关键词高亮</Text>
                </Space>
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  自动识别并高亮重点内容
                </div>
              </div>
              
              {keywordHighlight && (
                <>
                  <div>
                    <Text strong>高亮样式：</Text>
                    <Select
                      value={highlightStyle}
                      onChange={setHighlightStyle}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      <Option value="background">背景高亮</Option>
                      <Option value="underline">下划线</Option>
                      <Option value="border">边框</Option>
                      <Option value="glow">发光效果</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>高亮强度：</Text>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={highlightIntensity}
                      onChange={setHighlightIntensity}
                      marks={{
                        0.1: '淡',
                        0.5: '中',
                        1: '浓'
                      }}
                      style={{ marginTop: 8 }}
                    />
                    <Text type="secondary">{Math.round(highlightIntensity * 100)}%</Text>
                  </div>
                </>
              )}
              
              <div>
                <Text strong>语音设置：</Text>
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text>语速：</Text>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={speechRate}
                      onChange={setSpeechRate}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <Text>音调：</Text>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={speechPitch}
                      onChange={setSpeechPitch}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Space>
                  <Switch
                    checked={highlightMode === 'word'}
                    onChange={(checked) => setHighlightMode(checked ? 'word' : 'sentence')}
                  />
                  <Text>词语高亮</Text>
                </Space>
              </div>
              
              <div>
                <Space>
                  <Switch
                    checked={showNumbers}
                    onChange={setShowNumbers}
                  />
                  <Text>显示段落编号</Text>
                </Space>
              </div>
              
              <div>
                <Text strong>文本复杂度：</Text>
                <Select
                  value={textComplexity}
                  onChange={setTextComplexity}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="original">原文（显示复杂度）</Option>
                  <Option value="simple">简化版</Option>
                  <Option value="simplified">极简版</Option>
                </Select>
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  <div>• 原文：保持原始文本，显示复杂度指示器</div>
                  <div>• 简化版：替换复杂词汇，保持句子结构</div>
                  <div>• 极简版：分解长句，使用最简单词汇</div>
                </div>
              </div>
            </Space>
          </Card>
          
          {/* 控制按钮 */}
          <Card title="阅读控制">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Progress 
                percent={readingProgress} 
                size="small"
                strokeColor="#1890ff"
              />
              <Text type="secondary">
                进度：{currentSentence + 1} / {sentences.length}
              </Text>
              
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                {!isPlaying ? (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={startReading}
                    disabled={sentences.length === 0}
                  >
                    开始阅读
                  </Button>
                ) : (
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={pauseReading}
                  >
                    暂停
                  </Button>
                )}
                
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetReading}
                >
                  重置
                </Button>
                
                <Tooltip title="朗读当前句子">
                  <Button
                    icon={<SoundOutlined />}
                    onClick={() => {
                      if (sentences[currentSentence]) {
                        speakText(sentences[currentSentence]);
                      }
                    }}
                    disabled={sentences.length === 0}
                  />
                </Tooltip>
              </Space>
            </Space>
          </Card>
        </Col>
        
        {/* 阅读内容 */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <EyeOutlined />
                {selectedContent !== 'custom' ? sampleTexts[selectedContent]?.title : '自定义内容'}
              </Space>
            }
            style={{ minHeight: 600 }}
          >
            {renderContent()}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ReadingPage;