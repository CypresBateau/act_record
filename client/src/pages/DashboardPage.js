import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Event,
  Group,
  TrendingUp,
  Assignment,
  Add,
  CalendarToday
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { activityService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['activity-stats', user?.id],
    activityService.getStats,
    {
      enabled: !!user?.id
    }
  );

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery(
    ['recent-activities', user?.id],
    () => activityService.getActivities({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    {
      enabled: !!user?.id
    }
  );

  if (statsLoading || activitiesLoading) {
    return <LoadingScreen />;
  }

  const overview = stats?.data?.overview || {};
  const departmentStats = stats?.data?.departmentStats || [];
  const statusStats = stats?.data?.statusStats || [];
  const activities = recentActivities?.data?.activities || [];

  const getStatusColor = (status) => {
    switch (status) {
      case '已完成': return 'success';
      case '进行中': return 'primary';
      case '计划中': return 'warning';
      case '已取消': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          欢迎回来，{user?.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/activities/new')}
        >
          新建活动
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总活动数"
            value={overview.totalActivities}
            icon={<Event />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="已完成活动"
            value={overview.completedActivities}
            icon={<Assignment />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总预算"
            value={`¥${overview.totalBudget?.toLocaleString() || 0}`}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总支出"
            value={`¥${overview.totalExpenses?.toLocaleString() || 0}`}
            icon={<Group />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              部门活动统计
            </Typography>
            {departmentStats.map((dept) => (
              <Box key={dept._id} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    {dept._id}
                  </Typography>
                  <Typography variant="body2">
                    {dept.count} 个活动 ({dept.completedCount} 已完成)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dept.count > 0 ? (dept.completedCount / dept.count) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              活动状态分布
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {statusStats.map((status) => (
                <Chip
                  key={status._id}
                  label={`${status._id} (${status.count})`}
                  color={getStatusColor(status._id)}
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                最近活动
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/activities')}
              >
                查看全部
              </Button>
            </Box>
            <List>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ListItem
                    key={activity._id}
                    button
                    onClick={() => navigate(`/activities/${activity._id}`)}
                    divider
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {activity.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={activity.status}
                            color={getStatusColor(activity.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.department} • {activity.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {dayjs(activity.startTime).format('YYYY-MM-DD HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    暂无活动记录
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;