import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  FilterList
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { activityService, DEPARTMENTS, ACTIVITY_STATUS, ACTIVITY_FORMATS } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { LOADING_MESSAGES } from '../utils/apiWithLoading';
import LoadingScreen from '../components/LoadingScreen';

const ActivitiesPage = () => {
  const { permissions, user } = useAuth();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: activitiesData, isLoading } = useQuery(
    ['activities', user?.id, page + 1, rowsPerPage, search, department, status, format],
    () => activityService.getActivities({
      page: page + 1,
      limit: rowsPerPage,
      search,
      department,
      status,
      format
    }),
    {
      keepPreviousData: true,
      enabled: !!user?.id
    }
  );

  const deleteMutation = useMutation(activityService.deleteActivity, {
    onMutate: () => {
      setLoading(true, LOADING_MESSAGES.ACTIVITY_DELETING);
    },
    onSuccess: () => {
      queryClient.invalidateQueries('activities');
      setDeleteDialogOpen(false);
      setSelectedActivity(null);
      setAnchorEl(null);
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const activities = activitiesData?.data?.activities || [];
  const total = activitiesData?.data?.total || 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, activity) => {
    setAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (selectedActivity) {
      deleteMutation.mutate(selectedActivity._id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '已完成': return 'success';
      case '进行中': return 'primary';
      case '计划中': return 'warning';
      case '已取消': return 'error';
      default: return 'default';
    }
  };

  const canEdit = (activity) => {
    return permissions.canEditAll ||
           (permissions.departments.includes(activity.department));
  };

  const canDelete = (activity) => {
    return permissions.canDelete ||
           (permissions.canEditAll && permissions.departments.includes(activity.department));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          活动管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/activities/new')}
        >
          新建活动
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="搜索活动..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>部门</InputLabel>
                <Select
                  value={department}
                  label="部门"
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>状态</InputLabel>
                <Select
                  value={status}
                  label="状态"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {ACTIVITY_STATUS.map((stat) => (
                    <MenuItem key={stat} value={stat}>{stat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>形式</InputLabel>
                <Select
                  value={format}
                  label="形式"
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {ACTIVITY_FORMATS.map((fmt) => (
                    <MenuItem key={fmt} value={fmt}>{fmt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearch('');
                  setDepartment('');
                  setStatus('');
                  setFormat('');
                }}
              >
                清除筛选
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>活动名称</TableCell>
              <TableCell>部门</TableCell>
              <TableCell>开始时间</TableCell>
              <TableCell>地点</TableCell>
              <TableCell>形式</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>组织者</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity._id} hover>
                <TableCell>
                  <Typography variant="subtitle2">
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.description.length > 50
                      ? `${activity.description.substring(0, 50)}...`
                      : activity.description
                    }
                  </Typography>
                </TableCell>
                <TableCell>{activity.department}</TableCell>
                <TableCell>
                  {dayjs(activity.startTime).format('YYYY-MM-DD HH:mm')}
                </TableCell>
                <TableCell>{activity.location}</TableCell>
                <TableCell>{activity.format}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={activity.status}
                    color={getStatusColor(activity.status)}
                  />
                </TableCell>
                <TableCell>{activity.organizer?.name}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/activities/${activity._id}`)}
                  >
                    <Visibility />
                  </IconButton>
                  {canEdit(activity) && (
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/activities/${activity._id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                  )}
                  {canDelete(activity) && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, activity)}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示："
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} 共 ${count !== -1 ? count : `超过 ${to}`} 条`
          }
        />
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          删除活动
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedActivity(null); }}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          确定要删除活动 "{selectedActivity?.title}" 吗？此操作不可撤销。
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setSelectedActivity(null); }}>
            取消
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleteMutation.isLoading}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivitiesPage;