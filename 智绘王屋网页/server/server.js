const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 密钥加载 ====================
function loadKey(envName, fileName) {
  if (process.env[envName]) return String(process.env[envName]).trim();
  try {
    const f = path.join(__dirname, fileName);
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  } catch (e) {}
  return '';
}

// ==================== CORS ====================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 图片 base64 可能比较大，放大 limit
app.use(express.json({ limit: '10mb' }));

// 静态文件（前端页面）
app.use(express.static(path.join(__dirname, '..')));

// ==================== API 地址 ====================
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// ==================== 提示词 ====================
const TEXT_SYSTEM_PROMPT = `你是「智绘王屋」的 AI 旅游咨询助手，专门为游客提供济源王屋山地区的旅游咨询服务。

你的职责范围：
1. 当地游玩安排、景点推荐、行程规划
2. 旅游预算估算（按人数、天数细分）
3. 住宿推荐（民宿、农家乐、酒店等）
4. 当地特色美食、特产介绍
5. 门票、交通等实用信息

回答风格：亲切、专业、实用，像一个熟悉当地的朋友。用口语化的中文回答，不要太长，突出重点信息。可以适当提醒游客注意防晒、带雨具、穿舒适的鞋等实用建议。

如果游客的问题超出旅游范围，可以礼貌引导回到旅游话题。`;

const VISION_SYSTEM_PROMPT = `你是「智绘王屋」的 AI 旅游助手，专门为济源王屋山地区的游客服务。

你的核心能力：
1. 识别王屋山景区内的景点、建筑、自然风光，并给出详细介绍和游览建议
2. 识别当地美食、特产、农家菜，并推荐在哪里可以品尝或购买
3. 识别民宿、农家乐的室内外环境，并给出住宿建议
4. 识别游客拍摄的照片，判断是否是王屋山景区内的场景

你的回答风格：
- 亲切友好，像一个当地导游
- 用口语化的中文回答
- 包含景点的历史背景、文化故事、游览建议
- 如果是美食，说明口味特点、推荐理由
- 如果是住宿，说明环境特色、价位参考
- 适当提醒实用信息（最佳游览时间、穿衣建议、注意事项等）

如果图片内容不是王屋山相关，也请友善地帮助用户识别，但提醒他这个功能最适合王屋山地区的场景。`;

// ==================== 文本聊天（DeepSeek）====================
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const DEEPSEEK_API_KEY = loadKey('DEEPSEEK_API_KEY', '.api-key');

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '无效的请求参数' });
  }

  // 判断是否有图片消息
  const hasImage = messages.some(function (m) {
    return m.content && Array.isArray(m.content) &&
      m.content.some(function (c) { return c.type === 'image_url'; });
  });

  // 有图片 → 走阿里云百炼 Qwen-VL
  if (hasImage) {
    return handleVisionRequest(messages, res);
  }

  // 无图片 → 走 DeepSeek
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({
      error: '未配置 API Key',
      detail: '请在 server 目录创建 .api-key 文件（一行，内容为 sk- 开头的密钥），或设置环境变量 DEEPSEEK_API_KEY'
    });
  }

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: TEXT_SYSTEM_PROMPT }, ...messages],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + DEEPSEEK_API_KEY
        },
        timeout: 60000,
        proxy: false
      }
    );

    const reply = response.data && response.data.choices && response.data.choices[0] &&
      response.data.choices[0].message && response.data.choices[0].message.content;
    if (!reply) {
      console.error('DeepSeek 返回异常:', JSON.stringify(response.data));
      return res.status(500).json({ error: 'AI 返回格式异常' });
    }
    res.json({ reply });
  } catch (error) {
    console.error('DeepSeek API 错误:', error.message);
    let detail = error.message;
    if (error.response && error.response.data) {
      const d = error.response.data;
      if (d.error && d.error.message) detail = d.error.message;
      else if (typeof d.error === 'string') detail = d.error;
      else if (d.message) detail = d.message;
      else detail = JSON.stringify(d);
    }
    if (/insufficient balance/i.test(String(detail))) {
      detail = '账户余额不足，请到 https://platform.deepseek.com 充值后再试';
    }
    res.status(500).json({ error: '调用 DeepSeek 失败', detail });
  }
});

// ==================== 识图（阿里云百炼 Qwen-VL）====================
async function handleVisionRequest(messages, res) {
  const ALI_API_KEY = loadKey('DASHSCOPE_API_KEY', '.dashscope-key');
  const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  if (!ALI_API_KEY) {
    return res.status(500).json({
      error: '未配置识图 API',
      detail: '请在 server 目录创建 .dashscope-key 文件（一行，内容为 sk- 开头的阿里云百炼密钥），或设置环境变量 DASHSCOPE_API_KEY'
    });
  }

  // 提取最后一条用户消息
  var userMsg = messages.filter(function (m) { return m.role === 'user'; }).slice(-1)[0];
  if (!userMsg || !userMsg.content) {
    return res.status(400).json({ error: '未找到图片消息' });
  }

  var rawContent = Array.isArray(userMsg.content)
    ? userMsg.content
    : [{ type: 'text', text: String(userMsg.content) }];

  var textPrompt = '';
  var imageParts = [];

  rawContent.forEach(function (c) {
    if (c.type === 'text') {
      textPrompt += c.text;
    }
    if (c.type === 'image_url' && c.image_url && c.image_url.url) {
      imageParts.push(c.image_url.url); // 带 data:image/...;base64, 前缀
    }
  });

  if (!imageParts.length) {
    return res.status(400).json({ error: '未找到有效图片' });
  }

  // 拼接识图 prompt
  var userText = textPrompt.trim();
  var finalPrompt;
  if (!userText) {
    finalPrompt = '请识别这张图片里的内容：这是王屋山景区的什么地方？有什么特色？有什么游览建议？请用中文回答。';
  } else {
    finalPrompt = '用户提问：' + userText + '\n\n请结合图片内容给出详细回答，重点结合王屋山地区的景点、美食、民宿等旅游信息，用中文回答。';
  }

  // 构造 qwen-vl 的 messages 格式
  var qwenMessages = [
    { role: 'system', content: [{ type: 'text', text: VISION_SYSTEM_PROMPT }] },
    {
      role: 'user',
      content: [
        // 第一张图（最多支持一张图的 API，这里只用第一张，压缩后 1024px 足够）
        { type: 'image_url', image_url: { url: imageParts[0] } },
        { type: 'text', text: finalPrompt }
      ]
    }
  ];

  try {
    var response = await axios.post(
      QWEN_API_URL,
      {
        model: 'qwen-vl-plus',
        messages: qwenMessages,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + ALI_API_KEY
        },
        timeout: 60000,
        proxy: false
      }
    );

    var reply = response.data && response.data.choices && response.data.choices[0] &&
      response.data.choices[0].message && response.data.choices[0].message.content;
    if (!reply) {
      console.error('Qwen-VL 返回异常:', JSON.stringify(response.data));
      return res.status(500).json({ error: 'AI 识图返回格式异常' });
    }
    res.json({ reply });
  } catch (error) {
    console.error('Qwen-VL API 错误:', error.message);
    var detail = error.message;
    if (error.response && error.response.data) {
      var d = error.response.data;
      if (d.error && d.error.message) detail = d.error.message;
      else if (typeof d.error === 'string') detail = d.error;
      else if (d.message) detail = d.message;
      else detail = JSON.stringify(d);
    }
    if (/insufficient|quota|balance/i.test(String(detail))) {
      detail = '阿里云百炼 API 余额或配额不足，请到 https://bailian.console.aliyun.com 充值后再试';
    }
    res.status(500).json({ error: 'AI 识图失败', detail });
  }
}

// ==================== 启动 ====================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║        智绘王屋 AI 服务已启动                      ║
╠══════════════════════════════════════════════════╣
║  前端页面:  http://localhost:${PORT}                 ║
║  文本聊天:  POST http://localhost:${PORT}/api/chat   ║
╠══════════════════════════════════════════════════╣
║  DeepSeek 文本密钥:  server/.api-key               ║
║  阿里云百炼识图密钥: server/.dashscope-key          ║
╚══════════════════════════════════════════════════╝
  `);
});
