const express = require('express');
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');
const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role, department, email, phone } = req.body;

    // 验证必填字段
    if (!username || !password || !name || !role) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    // 检测编码损坏（中文字符中包含乱码）
    const checkEncoding = (str) => {
      if (!str) return true;
      // 检查是否包含不可打印字符或明显的乱码
      return !/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/.test(str);
    };

    if (!checkEncoding(role) || !checkEncoding(department) || !checkEncoding(name)) {
      console.error('编码错误检测:', { role, department, name });
      return res.status(400).json({
        message: '数据编码错误，请确保使用UTF-8编码。如果通过浏览器注册请刷新页面重试。'
      });
    }

    // 验证部门字段（非主席必须有部门）
    if (role !== '主席' && !department) {
      return res.status(400).json({ message: '部长和部员必须选择部门' });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      name,
      role,
      department: role === '主席' ? undefined : department,
      email,
      phone
    });

    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
        phone: user.phone,
        permissions: user.getPermissions()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' });
    }

    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 检查账户是否被禁用
    if (!user.isActive) {
      return res.status(400).json({ message: '账户已被禁用，请联系管理员' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
        phone: user.phone,
        permissions: user.getPermissions()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
        phone: user.phone,
        permissions: user.getPermissions(),
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = req.user;

    // 更新允许修改的字段
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: '个人信息更新成功',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: '更新个人信息失败' });
  }
});

// 修改密码
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请输入当前密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少为6位' });
    }

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '密码修改失败' });
  }
});

// 验证token
router.get('/verify', auth, (req, res) => {
  const user = req.user;
  res.json({
    valid: true,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      email: user.email,
      phone: user.phone,
      permissions: user.getPermissions()
    }
  });
});

module.exports = router;