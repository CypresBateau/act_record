const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
require('dotenv').config();

const departments = ['学术部', '办公室', '实践部', '文体部', '宣传部'];

const seedUsers = [
  // 主席
  {
    username: 'admin',
    password: 'admin123',
    name: '陈思远',
    role: '主席',
    email: 'chensiyuan@example.com',
    phone: '13800138000'
  },
  // 各部部长
  {
    username: 'xueshubuz',
    password: 'password123',
    name: '张子涵',
    role: '部长',
    department: '学术部',
    email: 'zhangzihan@example.com',
    phone: '13800138001'
  },
  {
    username: 'bangongshiz',
    password: 'password123',
    name: '李明轩',
    role: '部长',
    department: '办公室',
    email: 'limingxuan@example.com',
    phone: '13800138002'
  },
  {
    username: 'shijianbuz',
    password: 'password123',
    name: '王雨欣',
    role: '部长',
    department: '实践部',
    email: 'wangyuxin@example.com',
    phone: '13800138003'
  },
  {
    username: 'wentibuz',
    password: 'password123',
    name: '赵宇航',
    role: '部长',
    department: '文体部',
    email: 'zhaoyuhang@example.com',
    phone: '13800138004'
  },
  {
    username: 'xuanchuanbuz',
    password: 'password123',
    name: '孙悦彤',
    role: '部长',
    department: '宣传部',
    email: 'sunyuetong@example.com',
    phone: '13800138005'
  },
  // 各部部员
  {
    username: 'xueshuy1',
    password: 'password123',
    name: '刘思琪',
    role: '部员',
    department: '学术部',
    email: 'liusiqi@example.com',
    phone: '13900139001'
  },
  {
    username: 'xueshuy2',
    password: 'password123',
    name: '周嘉诚',
    role: '部员',
    department: '学术部',
    email: 'zhoujiacheng@example.com',
    phone: '13900139002'
  },
  {
    username: 'bangongshiy1',
    password: 'password123',
    name: '吴雨涵',
    role: '部员',
    department: '办公室',
    email: 'wuyuhan@example.com',
    phone: '13900139003'
  },
  {
    username: 'shijiany1',
    password: 'password123',
    name: '郑浩然',
    role: '部员',
    department: '实践部',
    email: 'zhenghaoran@example.com',
    phone: '13900139004'
  },
  {
    username: 'shijiany2',
    password: 'password123',
    name: '林雨诗',
    role: '部员',
    department: '实践部',
    email: 'linyushi@example.com',
    phone: '13900139005'
  },
  {
    username: 'wentiy1',
    password: 'password123',
    name: '黄子轩',
    role: '部员',
    department: '文体部',
    email: 'huangzixuan@example.com',
    phone: '13900139006'
  },
  {
    username: 'wentiy2',
    password: 'password123',
    name: '徐梦瑶',
    role: '部员',
    department: '文体部',
    email: 'xumengyao@example.com',
    phone: '13900139007'
  },
  {
    username: 'xuanchuany1',
    password: 'password123',
    name: '何俊杰',
    role: '部员',
    department: '宣传部',
    email: 'hejunjie@example.com',
    phone: '13900139008'
  },
  {
    username: 'xuanchuany2',
    password: 'password123',
    name: '马诗雨',
    role: '部员',
    department: '宣传部',
    email: 'mashiyu@example.com',
    phone: '13900139009'
  }
];

// 生成相对日期的辅助函数
function getRelativeDate(daysOffset, hours = 0, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// 活动数据生成函数（在创建活动时会设置organizer和expenses.submittedBy）
function generateActivities() {
  return [
    // 已完成的活动
    {
      title: '新生迎新晚会',
      description: '欢迎2024级新生加入我校，通过精彩的文艺表演展现研究生会风采，帮助新生快速融入研究生生活。晚会包含歌舞表演、小品、互动游戏等多个环节。',
      department: '文体部',
      startTime: getRelativeDate(-45, 19, 0),
      endTime: getRelativeDate(-45, 21, 30),
      location: '学校大礼堂',
      format: '线下',
      status: '已完成',
      participants: { expected: 800, actual: 856 },
      budget: { planned: 15000 },
      promotionContent: '🎉 2024级新生迎新晚会即将拉开帷幕！精彩节目、惊喜互动、丰厚奖品等你来！让我们一起开启美好的大学生活！',
      summary: '晚会圆满成功，新生反响热烈，现场气氛活跃。各项节目质量高，舞台效果出色。部分物料采购超出预算，但整体控制良好。',
      tags: ['迎新', '晚会', '文艺'],
      expenses: []  // 将在seed函数中添加submittedBy
    },
    {
      title: '学术讲座：人工智能与未来',
      description: '邀请计算机学院教授为同学们讲解人工智能的发展趋势、应用场景及学习路径，帮助同学们了解前沿科技，规划学习方向。',
      department: '学术部',
      startTime: getRelativeDate(-30, 14, 0),
      endTime: getRelativeDate(-30, 16, 30),
      location: '图书馆学术报告厅',
      format: '线上线下结合',
      status: '已完成',
      participants: { expected: 150, actual: 178 },
      budget: { planned: 2000 },
      promotionContent: '🔬 想了解AI如何改变世界吗？想知道如何学习人工智能吗？学术部特邀名师为您解答！线上线下同步进行，扫码报名！',
      summary: '讲座内容丰富，教授讲解深入浅出。线上直播效果良好，互动环节活跃。预算控制良好，未超支。',
      tags: ['学术', '讲座', 'AI', '科技'],
      expenses: []
    },
    {
      title: '秋季志愿者招募活动',
      description: '为即将开展的社区服务、敬老院慰问、环保宣传等志愿活动招募志愿者，并进行志愿服务培训。',
      department: '实践部',
      startTime: getRelativeDate(-20, 9, 0),
      endTime: getRelativeDate(-20, 12, 0),
      location: '学生活动中心',
      format: '线下',
      status: '已完成',
      participants: { expected: 60, actual: 73 },
      budget: { planned: 800 },
      promotionContent: '💪 用行动传递温暖，用爱心点亮生活！实践部秋季志愿者招募开始啦！多个项目等你选择，还有志愿服务证书哦！',
      summary: '招募效果超出预期，志愿者热情高涨。培训内容完善，志愿者反馈良好。物料准备充分。',
      tags: ['志愿', '招募', '培训'],
      expenses: []
    },

    // 进行中的活动
    {
      title: '校园文化周摄影大赛',
      description: '以"发现校园之美"为主题，鼓励同学们用镜头记录校园生活，展现校园文化。作品将在校园各处展出，优秀作品将获得奖励。',
      department: '宣传部',
      startTime: getRelativeDate(-7, 0, 0),
      endTime: getRelativeDate(7, 23, 59),
      location: '全校范围及线上投稿平台',
      format: '线上线下结合',
      status: '进行中',
      participants: { expected: 200, actual: 134 },
      budget: { planned: 3000 },
      promotionContent: '📷 用镜头定格美好瞬间！校园文化周摄影大赛火热进行中！一等奖1000元+证书，还有精美礼品等你拿！快来投稿吧！',
      tags: ['摄影', '文化', '比赛'],
      expenses: []
    },
    {
      title: '期中考试复习资料整理',
      description: '办公室组织各部门收集整理各科目的复习资料、往年试题，建立共享资料库，帮助同学们更好地备考。',
      department: '办公室',
      startTime: getRelativeDate(-5, 9, 0),
      endTime: getRelativeDate(5, 18, 0),
      location: '办公室及线上文档',
      format: '线上',
      status: '进行中',
      participants: { expected: 30, actual: 0 },
      budget: { planned: 500 },
      promotionContent: '📚 期中考试复习不用愁！研究生会为你整理各科复习资料！关注公众号获取下载链接！',
      tags: ['学习', '资料', '考试'],
      expenses: []
    },

    // 计划中的活动
    {
      title: '冬季长跑比赛',
      description: '为增强同学们的体质，培养坚持锻炼的好习惯，文体部组织冬季长跑比赛。设置男女不同组别，完成比赛即可获得纪念奖牌。',
      department: '文体部',
      startTime: getRelativeDate(15, 7, 0),
      endTime: getRelativeDate(15, 10, 0),
      location: '学校操场',
      format: '线下',
      status: '计划中',
      participants: { expected: 300, actual: 0 },
      budget: { planned: 4000 },
      promotionContent: '🏃 冬季长跑，挑战自我！文体部邀你一起跑起来！完赛即得纪念奖牌，前三名还有丰厚奖品！报名通道已开启！',
      tags: ['体育', '长跑', '比赛'],
      expenses: []
    },
    {
      title: '企业参观实践活动',
      description: '组织同学们参观知名企业，了解企业文化和运营模式，与企业高管面对面交流，为未来职业规划提供参考。',
      department: '实践部',
      startTime: getRelativeDate(20, 13, 0),
      endTime: getRelativeDate(20, 17, 0),
      location: '科技园区企业',
      format: '线下',
      status: '计划中',
      participants: { expected: 40, actual: 0 },
      budget: { planned: 2000 },
      promotionContent: '🏢 走进名企，探索未来！实践部带你参观科技企业，与行业精英面对面！名额有限，先到先得！',
      tags: ['实践', '企业', '参观', '职业'],
      expenses: []
    },
    {
      title: '考研经验分享会',
      description: '邀请成功考研的学长学姐分享备考经验，包括院校选择、复习规划、心态调整等方面，为考研学子答疑解惑。',
      department: '学术部',
      startTime: getRelativeDate(25, 19, 0),
      endTime: getRelativeDate(25, 21, 0),
      location: '教学楼A201',
      format: '线上线下结合',
      status: '计划中',
      participants: { expected: 120, actual: 0 },
      budget: { planned: 1000 },
      promotionContent: '🎓 考研路上不孤单！学长学姐来指路！从择校到上岸，全程干货分享！线上线下同步，扫码预约座位！',
      tags: ['考研', '学习', '经验分享'],
      expenses: []
    },
    {
      title: '元旦晚会筹备会议',
      description: '各部门负责人集中讨论元旦晚会的策划方案，包括节目安排、预算分配、人员分工等事项。',
      department: '办公室',
      startTime: getRelativeDate(10, 14, 0),
      endTime: getRelativeDate(10, 16, 0),
      location: '研究生会办公室',
      format: '线下',
      status: '计划中',
      participants: { expected: 15, actual: 0 },
      budget: { planned: 200 },
      promotionContent: '内部会议，无需宣传',
      tags: ['会议', '筹备', '元旦'],
      expenses: []
    },
    {
      title: '新媒体运营培训',
      description: '为提升研究生会各部门的新媒体运营能力，宣传部组织培训，内容包括文案写作、图片设计、视频剪辑、数据分析等。',
      department: '宣传部',
      startTime: getRelativeDate(18, 15, 0),
      endTime: getRelativeDate(18, 17, 30),
      location: '计算机机房',
      format: '线下',
      status: '计划中',
      participants: { expected: 50, actual: 0 },
      budget: { planned: 800 },
      promotionContent: '📱 想成为新媒体达人吗？宣传部手把手教你！从0到1打造爆款内容！实战演练，即学即用！',
      tags: ['培训', '新媒体', '技能'],
      expenses: []
    },

    // 已取消的活动
    {
      title: '户外拓展训练',
      description: '原计划组织研究生会成员进行户外团建活动，增强团队凝聚力。因天气原因取消，将另行安排。',
      department: '文体部',
      startTime: getRelativeDate(-3, 8, 0),
      endTime: getRelativeDate(-3, 18, 0),
      location: '郊外拓展基地',
      format: '线下',
      status: '已取消',
      participants: { expected: 80, actual: 0 },
      budget: { planned: 5000 },
      promotionContent: '🏕️ 研究生会团建活动来啦！户外拓展、团队挑战、美食BBQ！快来报名吧！',
      summary: '因连续阴雨天气，出于安全考虑决定取消本次活动。已支付的定金500元无法退回。计划在下月天气好转后重新组织。',
      tags: ['团建', '户外', '拓展'],
      expenses: []
    }
  ];
}

async function seedDatabase() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_union_archive');
    console.log('✓ 数据库连接成功');

    // 清空现有数据
    await User.deleteMany({});
    await Activity.deleteMany({});
    console.log('✓ 清空现有数据');

    // 创建用户
    console.log('\n正在创建用户...');
    const users = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`  ✓ ${user.name} (${user.role}${user.department ? ' - ' + user.department : ''})`);
    }
    console.log(`✓ 创建了 ${users.length} 个用户`);

    // 创建用户映射，方便查找
    const userMap = {
      admin: users[0],
      xueshubuz: users.find(u => u.username === 'xueshubuz'),
      bangongshiz: users.find(u => u.username === 'bangongshiz'),
      shijianbuz: users.find(u => u.username === 'shijianbuz'),
      wentibuz: users.find(u => u.username === 'wentibuz'),
      xuanchuanbuz: users.find(u => u.username === 'xuanchuanbuz'),
      xueshuy1: users.find(u => u.username === 'xueshuy1'),
      bangongshiy1: users.find(u => u.username === 'bangongshiy1'),
      shijiany1: users.find(u => u.username === 'shijiany1'),
      wentiy1: users.find(u => u.username === 'wentiy1'),
      xuanchuany1: users.find(u => u.username === 'xuanchuany1')
    };

    // 创建活动
    console.log('\n正在创建活动...');
    const activities = generateActivities();

    // 为每个活动设置organizer和expenses
    const expensesData = {
      '新生迎新晚会': [
        { item: '舞台搭建及灯光音响', amount: 8000, category: '场地费', description: '专业舞台搭建、灯光音响设备租赁', submittedBy: 'wentibuz' },
        { item: '服装道具租赁', amount: 3500, category: '物料费', description: '演员服装和节目道具', submittedBy: 'wentiy1' },
        { item: '宣传物料制作', amount: 1200, category: '物料费', description: '海报、展架、横幅等', submittedBy: 'xuanchuany1' },
        { item: '奖品采购', amount: 2800, category: '其他', description: '互动游戏奖品', submittedBy: 'wentibuz' }
      ],
      '学术讲座：人工智能与未来': [
        { item: '讲师费用', amount: 800, category: '人员费', description: '主讲教授讲课费', submittedBy: 'xueshubuz' },
        { item: '场地布置', amount: 300, category: '场地费', description: '报告厅布置及茶水', submittedBy: 'xueshuy1' },
        { item: '线上直播平台', amount: 200, category: '其他', description: '会议直播平台月费', submittedBy: 'xueshuy1' },
        { item: '资料印刷', amount: 150, category: '物料费', description: '讲座资料打印', submittedBy: 'xueshuy1' }
      ],
      '秋季志愿者招募活动': [
        { item: '培训物料', amount: 400, category: '物料费', description: '培训手册、志愿者证书', submittedBy: 'shijianbuz' },
        { item: '活动宣传', amount: 250, category: '物料费', description: '招募海报、易拉宝', submittedBy: 'xuanchuany1' },
        { item: '茶水点心', amount: 180, category: '其他', description: '培训期间茶水点心', submittedBy: 'shijiany1' }
      ],
      '校园文化周摄影大赛': [
        { item: '奖品采购', amount: 1800, category: '其他', description: '一二三等奖及优秀奖奖品', submittedBy: 'xuanchuanbuz' },
        { item: '作品展览', amount: 600, category: '场地费', description: '作品打印及展板租赁', submittedBy: 'xuanchuany1' }
      ],
      '户外拓展训练': [
        { item: '活动定金', amount: 500, category: '其他', description: '拓展基地定金（已取消无法退回）', submittedBy: 'wentibuz' }
      ]
    };

    for (const activityData of activities) {
      // 根据部门找到对应的部长作为组织者
      const organizer = users.find(user =>
        user.department === activityData.department && user.role === '部长'
      ) || users[0];

      // 添加expenses（如果有）
      const expenseList = expensesData[activityData.title] || [];
      const expenses = expenseList.map(expense => ({
        ...expense,
        submittedBy: userMap[expense.submittedBy]._id
      }));

      const activity = new Activity({
        ...activityData,
        organizer: organizer._id,
        expenses
      });

      await activity.save();
      const statusIcon = {
        '已完成': '✓',
        '进行中': '▶',
        '计划中': '○',
        '已取消': '✕'
      }[activity.status];
      console.log(`  ${statusIcon} ${activity.title} [${activity.status}] - ${activity.department}`);
    }
    console.log(`✓ 创建了 ${activities.length} 个活动`);

    // 统计信息
    const stats = {
      completed: activities.filter(a => a.status === '已完成').length,
      inProgress: activities.filter(a => a.status === '进行中').length,
      planned: activities.filter(a => a.status === '计划中').length,
      cancelled: activities.filter(a => a.status === '已取消').length
    };

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('           数据种子初始化完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 数据统计：');
    console.log(`  用户: ${users.length} 个 (1主席 + 5部长 + ${users.length - 6}部员)`);
    console.log(`  活动: ${activities.length} 个 (已完成${stats.completed} | 进行中${stats.inProgress} | 计划中${stats.planned} | 已取消${stats.cancelled})`);

    console.log('\n👤 测试账户：');
    console.log('┌────────────────────────────────────────┐');
    console.log('│ 角色     │ 用户名           │ 密码      │');
    console.log('├────────────────────────────────────────┤');
    console.log('│ 主席     │ admin            │ admin123  │');
    console.log('│ 学术部长 │ xueshubuz        │ password123│');
    console.log('│ 办公室长 │ bangongshiz      │ password123│');
    console.log('│ 实践部长 │ shijianbuz       │ password123│');
    console.log('│ 文体部长 │ wentibuz         │ password123│');
    console.log('│ 宣传部长 │ xuanchuanbuz     │ password123│');
    console.log('│ 学术部员 │ xueshuy1         │ password123│');
    console.log('│ 办公室员 │ bangongshiy1     │ password123│');
    console.log('│ 实践部员 │ shijiany1        │ password123│');
    console.log('│ 文体部员 │ wentiy1          │ password123│');
    console.log('│ 宣传部员 │ xuanchuany1      │ password123│');
    console.log('└────────────────────────────────────────┘');
    console.log('\n💡 提示：使用上述账户登录系统测试不同角色的权限');

  } catch (error) {
    console.error('\n❌ 数据种子初始化失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ 数据库连接已关闭');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;