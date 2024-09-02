const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

const TIMEOUT = 1500;

// 增加请求体大小限制
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 设置文件上传目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 创建 multer 实例，增加文件大小限制
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 文件大小限制
  }
});

// 统一的上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  const { ext } = req.query;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (ext === 'json') {
    // 对于 JSON 文件，已经通过 multer 存储，无需额外处理
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // 模拟延迟
    setTimeout(() => {
      res.json({ url: fileUrl });
    }, TIMEOUT);
  } else if (['png', 'jpg', 'webp'].includes(ext)) {
    // 对于图片等二进制文件，直接返回 URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // 模拟延迟
    setTimeout(() => {
      res.json({ url: fileUrl });
    }, TIMEOUT);
  } else {
    return res.status(400).json({ error: 'Unsupported file type' });
  }
});

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  if (!filename) {
    return res.status(400).json({ error: 'No filename provided' });
  }

  // 解析文件路径
  const filePath = path.join(__dirname, 'uploads', filename);
  const fileExt = path.extname(filename).toLowerCase();

  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // 根据扩展名处理响应
    if (fileExt === '.json') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to read JSON file' });
        }
        res.json(JSON.parse(data)); // 返回 JSON 数据
      });
    } else if (['.png', '.jpg', '.webp'].includes(fileExt)) {
      res.sendFile(filePath); // 返回二进制文件
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
