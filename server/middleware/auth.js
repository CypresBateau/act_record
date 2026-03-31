const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JWT令牌
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '没有访问令牌，访问被拒绝' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: '令牌无效' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: '账户已被禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: '令牌无效' });
  }
};

// 检查是否有权限访问特定部门的活动
const checkDepartmentAccess = (req, res, next) => {
  const { department } = req.params;
  const user = req.user;

  // 主席和部长可以访问所有部门
  if (user.role === '主席' || user.role === '部长') {
    return next();
  }

  // 部员只能访问自己部门的活动
  if (user.department !== department) {
    return res.status(403).json({ message: '没有权限访问该部门的活动' });
  }

  next();
};

// 检查是否有管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== '主席' && req.user.role !== '部长') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// 检查是否有编辑权限
const checkEditPermission = async (req, res, next) => {
  try {
    const user = req.user;

    // 主席和部长可以编辑所有活动
    if (user.role === '主席' || user.role === '部长') {
      return next();
    }

    // 获取activityId - 支持不同的参数名
    const activityId = req.params.id || req.params.activityId;

    // 如果是活动相关的路由，检查部门权限
    if (activityId && (req.originalUrl.includes('/activities/') || req.originalUrl.includes('/files/'))) {
      const Activity = require('../models/Activity');
      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({ message: '活动不存在' });
      }

      // 部员只能编辑自己部门的活动
      if (activity.department !== user.department) {
        return res.status(403).json({ message: '没有权限编辑该活动' });
      }
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ message: '权限检查失败' });
  }
};

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  auth,
  checkDepartmentAccess,
  requireAdmin,
  checkEditPermission,
  generateToken
};