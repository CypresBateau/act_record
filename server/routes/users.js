const express = require('express');
const User = require('../models/User');
const { auth, requireAdmin, generateToken } = require('../middleware/auth');
const router = express.Router();

// 创建新用户（管理员权限）
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { username, password, name, role, department, email, phone } = req.body;

    // 验证必填字段
    if (!username || !password || !name || !role) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    // 验证用户名唯一性
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 创建用户
    const user = new User({
      username,
      password,
      name,
      role,
      department,
      email,
      phone,
      isActive: true
    });

    await user.save();

    res.status(201).json({
      message: '用户创建成功',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: '创建用户失败' });
  }
});

// 获取所有用户（管理员权限）
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, department, role, search, isActive } = req.query;
    const query = {};

    // 调试日志
    console.log('收到的查询参数:', { page, limit, department, role, search, isActive });

    // 构建查询条件
    if (department) {
      query.department = department;
    }

    if (role) {
      query.role = role;
    }

    // isActive筛选
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
      console.log('设置 isActive 筛选:', query.isActive);
    }

    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    console.log('最终的查询条件:', JSON.stringify(query));

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    console.log(`返回 ${users.length} 个用户，总共 ${total} 个`);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 获取单个用户信息（管理员权限）
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 更新用户信息（管理员权限）
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, role, department, email, phone, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 防止修改自己的权限
    if (user._id.toString() === req.user._id.toString() && role && role !== user.role) {
      return res.status(400).json({ message: '不能修改自己的角色' });
    }

    // 更新字段
    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: '用户信息更新成功',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: '更新用户信息失败' });
  }
});

// 删除用户（管理员权限）
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 防止删除自己
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能删除自己的账户' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

// 禁用/启用用户（管理员权限）
router.put('/:id/toggle-status', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 防止禁用自己
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能禁用自己的账户' });
    }

    // 切换状态
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? '用户已启用' : '用户已禁用',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: '切换用户状态失败' });
  }
});

// 重置用户密码（管理员权限）
router.put('/:id/reset-password', auth, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少为6位' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: '密码重置失败' });
  }
});

// 获取用户统计信息（管理员权限）
router.get('/stats/overview', auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByDepartment = await User.aggregate([
      { $match: { department: { $exists: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole,
      usersByDepartment
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: '获取用户统计信息失败' });
  }
});

module.exports = router;