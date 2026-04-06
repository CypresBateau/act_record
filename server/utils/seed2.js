const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
require('dotenv').config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_union_archive');
    console.log('✓ 数据库连接成功');

    await User.deleteMany({});
    await Activity.deleteMany({});
    console.log('✓ 清空所有数据');

    const admin = new User({
      username: 'admin',
      password: 'admin123',
      name: '管理员',
      role: '主席',
      status: 'active'
    });
    await admin.save();
    console.log('✓ 管理员账号创建成功');

    console.log('\n账号：admin / admin123');
    console.log('⚠ 首次登录后请立即修改密码！');

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
