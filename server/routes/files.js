const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Activity = require('../models/Activity');
const { auth, checkEditPermission } = require('../middleware/auth');
const router = express.Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 确保文件名使用UTF-8编码处理
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// 上传文件到活动
router.post('/upload/:activityId', auth, checkEditPermission, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件大小超过限制（最大10MB）' });
      }
      if (err.message === '不支持的文件类型') {
        return res.status(400).json({ message: '不支持的文件类型' });
      }
      return res.status(500).json({ message: '文件上传失败: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    const { category, description } = req.body;
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) {
      // 如果活动不存在，删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: '活动不存在' });
    }

    if (!category) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: '请选择文件分类' });
    }

    // 修复文件名编码问题
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const fileInfo = {
      filename: req.file.filename,
      originalName: originalName,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category,
      description: description || '',
      uploadedBy: req.user._id
    };

    activity.files.push(fileInfo);
    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('files.uploadedBy', 'name username');

    const uploadedFile = populatedActivity.files[populatedActivity.files.length - 1];

    res.json({
      message: '文件上传成功',
      file: uploadedFile
    });
  } catch (error) {
    // 如果出错，删除已上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('File upload error:', error);

    if (error.message === '不支持的文件类型') {
      return res.status(400).json({ message: '不支持的文件类型' });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '文件大小超过限制' });
    }

    res.status(500).json({ message: '文件上传失败' });
  }
});

// 批量上传文件
router.post('/upload-multiple/:activityId', auth, checkEditPermission, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    const { category, description } = req.body;
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) {
      // 删除所有已上传的文件
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(404).json({ message: '活动不存在' });
    }

    if (!category) {
      // 删除所有已上传的文件
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({ message: '请选择文件分类' });
    }

    const uploadedFiles = [];

    req.files.forEach(file => {
      // 修复文件名编码问题
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      const fileInfo = {
        filename: file.filename,
        originalName: originalName,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        category,
        description: description || '',
        uploadedBy: req.user._id
      };

      activity.files.push(fileInfo);
      uploadedFiles.push(fileInfo);
    });

    await activity.save();

    res.json({
      message: `成功上传 ${uploadedFiles.length} 个文件`,
      files: uploadedFiles
    });
  } catch (error) {
    // 如果出错，删除所有已上传的文件
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error('Multiple file upload error:', error);
    res.status(500).json({ message: '批量文件上传失败' });
  }
});

// 获取文件列表
router.get('/:activityId', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId)
      .populate('files.uploadedBy', 'name username')
      .select('files department');

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 权限检查
    if (req.user.role === '部员' && activity.department !== req.user.department) {
      return res.status(403).json({ message: '没有权限查看该活动的文件' });
    }

    const { category } = req.query;
    let files = activity.files;

    if (category) {
      files = files.filter(file => file.category === category);
    }

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: '获取文件列表失败' });
  }
});

// 下载文件
router.get('/download/:activityId/:fileId', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 权限检查
    if (req.user.role === '部员' && activity.department !== req.user.department) {
      return res.status(403).json({ message: '没有权限下载该文件' });
    }

    const file = activity.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: '文件不存在' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: '文件已丢失' });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: '文件下载失败' });
  }
});

// 删除文件
router.delete('/:activityId/:fileId', auth, checkEditPermission, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    const file = activity.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: '文件不存在' });
    }

    // 删除物理文件
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // 从数据库中删除文件记录（Mongoose 6+ 使用 pull）
    activity.files.pull(req.params.fileId);
    await activity.save();

    res.json({ message: '文件删除成功' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: '文件删除失败' });
  }
});

// 更新文件信息
router.put('/:activityId/:fileId', auth, checkEditPermission, async (req, res) => {
  try {
    const { description, category } = req.body;
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    const file = activity.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: '文件不存在' });
    }

    if (description !== undefined) file.description = description;
    if (category) file.category = category;

    await activity.save();

    res.json({
      message: '文件信息更新成功',
      file
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: '更新文件信息失败' });
  }
});

module.exports = router;