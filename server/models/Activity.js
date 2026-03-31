const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['场地费', '物料费', '人员费', '交通费', '其他'],
    required: true
  },
  receipt: {
    type: String, // 文件路径
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['活动文件', '宣传文案', '照片记录', '报销凭证'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  department: {
    type: String,
    enum: ['学术部', '办公室', '实践部', '文体部', '宣传部'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startTime;
      },
      message: '结束时间必须晚于开始时间'
    }
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  format: {
    type: String,
    enum: ['线上', '线下', '线上线下结合'],
    required: true
  },
  status: {
    type: String,
    enum: ['计划中', '进行中', '已完成', '已取消'],
    default: '计划中'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: {
    expected: {
      type: Number,
      min: 0
    },
    actual: {
      type: Number,
      min: 0
    }
  },
  budget: {
    planned: {
      type: Number,
      min: 0,
      default: 0
    },
    actual: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  expenses: [expenseSchema],
  files: [fileSchema],
  promotionContent: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引
activitySchema.index({ department: 1, createdAt: -1 });
activitySchema.index({ startTime: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ title: 'text', description: 'text' });

// 计算实际预算
activitySchema.virtual('actualBudget').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// 预算是否超支
activitySchema.virtual('isOverBudget').get(function() {
  return this.actualBudget > this.budget.planned;
});

// 活动持续时间（小时）
activitySchema.virtual('duration').get(function() {
  return Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60));
});

// 确保虚拟字段被序列化
activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Activity', activitySchema);