const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['主席', '部长', '部员'],
    required: true
  },
  department: {
    type: String,
    enum: ['学术部', '办公室', '实践部', '文体部', '宣传部'],
    required: function() {
      return this.role !== '主席';
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// 获取用户权限
userSchema.methods.getPermissions = function() {
  const permissions = {
    canViewAll: this.role === '主席' || this.role === '部长',
    canEditAll: this.role === '主席' || this.role === '部长',
    canDelete: this.role === '主席' || this.role === '部长',
    departments: this.role === '主席' || this.role === '部长'
      ? ['学术部', '办公室', '实践部', '文体部', '宣传部']
      : [this.department]
  };
  return permissions;
};

// 隐藏密码字段
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);