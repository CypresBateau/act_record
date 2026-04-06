const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = [
  {
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    role: '主席',
    status: 'active'
  },
  {
    username: 'xueshubuz',
    password: 'password123',
    name: '学术部部长',
    role: '部长',
    department: '学术部',
    status: 'active'
  },
  {
    username: 'bangongshiz',
    password: 'password123',
    name: '办公室部长',
    role: '部长',
    department: '办公室',
    status: 'active'
  },
  {
    username: 'shijianbuz',
    password: 'password123',
    name: '实践部部长',
    role: '部长',
    department: '实践部',
    status: 'active'
  },
  {
    username: 'wentibuz',
    password: 'password123',
    name: '文体部部长',
    role: '部长',
    department: '文体部',
    status: 'active'
  },
  {
    username: 'xuanchuanbuz',
    password: 'password123',
    name: '宣传部部长',
    role: '部长',
    department: '宣传部',
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_union_archive');
    console.log('✓ 数据库连接成功');

    await User.deleteMany({});
    console.log('✓ 清空现有用户数据');

    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`  ✓ ${user.name} (${user.role}${user.department ? ' - ' + user.department : ''})`);
    }

    console.log(`\n✓ 初始化完成，共创建 ${seedUsers.length} 个用户`);
    console.log('\n账号列表：');
    console.log('  主席:   admin / admin123');
    console.log('  部长:   xueshubuz、bangongshiz、shijianbuz、wentibuz、xuanchuanbuz / password123');
    console.log('\n⚠ 首次登录后请立即修改密码！');

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
