const express = require('express');
const Activity = require('../models/Activity');
const { auth, checkEditPermission } = require('../middleware/auth');
const router = express.Router();

// 获取活动列表
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      status,
      search,
      startDate,
      endDate,
      format,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const user = req.user;
    const query = {};

    // 权限控制：部员只能看自己部门的活动
    if (user.role === '部员') {
      query.department = user.department;
    } else if (department) {
      query.department = department;
    }

    // 状态筛选
    if (status) {
      query.status = status;
    }

    // 活动形式筛选
    if (format) {
      query.format = format;
    }

    // 时间范围筛选
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    // 搜索功能
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // 排序配置
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const activities = await Activity.find(query)
      .populate('organizer', 'name username department')
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: '获取活动列表失败' });
  }
});

// 获取单个活动详情
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('organizer', 'name username department')
      .populate('files.uploadedBy', 'name username')
      .populate('expenses.submittedBy', 'name username');

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 权限检查：部员只能查看自己部门的活动
    if (req.user.role === '部员' && activity.department !== req.user.department) {
      return res.status(403).json({ message: '没有权限查看该活动' });
    }

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: '获取活动详情失败' });
  }
});

// 创建新活动
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      startTime,
      endTime,
      location,
      format,
      participants,
      budget,
      promotionContent,
      tags
    } = req.body;

    const user = req.user;

    // 权限检查：部员只能创建自己部门的活动
    if (user.role === '部员' && department !== user.department) {
      return res.status(403).json({ message: '只能创建自己部门的活动' });
    }

    // 验证必填字段
    if (!title || !description || !department || !startTime || !endTime || !location || !format) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    // 验证时间
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: '结束时间必须晚于开始时间' });
    }

    const activity = new Activity({
      title,
      description,
      department,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      format,
      organizer: user._id,
      participants,
      budget,
      promotionContent,
      tags: tags || []
    });

    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('organizer', 'name username department');

    res.status(201).json({
      message: '活动创建成功',
      activity: populatedActivity
    });
  } catch (error) {
    console.error('Create activity error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: '创建活动失败' });
  }
});

// 更新活动
router.put('/:id', auth, checkEditPermission, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    const {
      title,
      description,
      startTime,
      endTime,
      location,
      format,
      status,
      participants,
      budget,
      promotionContent,
      summary,
      tags
    } = req.body;

    // 更新字段
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (startTime) activity.startTime = new Date(startTime);
    if (endTime) activity.endTime = new Date(endTime);
    if (location) activity.location = location;
    if (format) activity.format = format;
    if (status) activity.status = status;
    if (participants) activity.participants = { ...activity.participants, ...participants };
    if (budget) activity.budget = { ...activity.budget, ...budget };
    if (promotionContent !== undefined) activity.promotionContent = promotionContent;
    if (summary !== undefined) activity.summary = summary;
    if (tags) activity.tags = tags;

    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('organizer', 'name username department');

    res.json({
      message: '活动更新成功',
      activity: populatedActivity
    });
  } catch (error) {
    console.error('Update activity error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: '更新活动失败' });
  }
});

// 删除活动
router.delete('/:id', auth, checkEditPermission, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.json({ message: '活动删除成功' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: '删除活动失败' });
  }
});

// 添加活动开销
router.post('/:id/expenses', auth, checkEditPermission, async (req, res) => {
  try {
    const { item, amount, category, description } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    if (!item || !amount || !category) {
      return res.status(400).json({ message: '请填写开销项目、金额和分类' });
    }

    activity.expenses.push({
      item,
      amount: parseFloat(amount),
      category,
      description,
      submittedBy: req.user.id,
      submittedAt: new Date()
    });

    await activity.save();

    res.json({
      message: '开销记录添加成功',
      expense: activity.expenses[activity.expenses.length - 1]
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: '添加开销记录失败' });
  }
});

// 更新活动开销
router.put('/:id/expenses/:expenseId', auth, checkEditPermission, async (req, res) => {
  try {
    const { item, amount, category, description } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    const expense = activity.expenses.id(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: '开销记录不存在' });
    }

    if (item) expense.item = item;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (description !== undefined) expense.description = description;

    await activity.save();

    res.json({
      message: '开销记录更新成功',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: '更新开销记录失败' });
  }
});

// 删除活动开销
router.delete('/:id/expenses/:expenseId', auth, checkEditPermission, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // Mongoose 6+ 使用 pull 替代 remove
    activity.expenses.pull(req.params.expenseId);
    await activity.save();

    res.json({ message: '开销记录删除成功' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: '删除开销记录失败' });
  }
});

// 获取活动统计信息
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const user = req.user;
    const matchQuery = {};

    // 权限控制
    if (user.role === '部员') {
      matchQuery.department = user.department;
    }

    const stats = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          completedActivities: {
            $sum: { $cond: [{ $eq: ['$status', '已完成'] }, 1, 0] }
          },
          totalBudget: { $sum: '$budget.planned' },
          totalExpenses: {
            $sum: {
              $reduce: {
                input: '$expenses',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.amount'] }
              }
            }
          }
        }
      }
    ]);

    const departmentStats = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', '已完成'] }, 1, 0] }
          }
        }
      }
    ]);

    const statusStats = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalActivities: 0,
        completedActivities: 0,
        totalBudget: 0,
        totalExpenses: 0
      },
      departmentStats,
      statusStats
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: '获取活动统计信息失败' });
  }
});

module.exports = router;