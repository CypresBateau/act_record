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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Badge
} from '@mui/material';
import {
  Add,
  Search,
  Lock,
  FilterList
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { userService, DEPARTMENTS, ROLES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { LOADING_MESSAGES } from '../utils/apiWithLoading';
import LoadingScreen from '../components/LoadingScreen';

const UsersPage = () => {
  const { permissions, user } = useAuth();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true); // 默认只显示活跃用户
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' | 'pending' | 'all'
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: '部员',
    department: '',
    email: '',
    phone: ''
  });

  // 构建查询参数
  const queryParams = {
    page: page + 1,
    limit: rowsPerPage,
    ...(search && { search }),
    ...(department && { department }),
    ...(role && { role }),
    ...(filterStatus === 'active' && { isActive: 'true' }),
    ...(filterStatus === 'pending' && { status: 'pending' }),
  };

  // 调试日志
  console.log('查询参数:', queryParams, 'filterStatus:', filterStatus);

  const { data: usersData, isLoading } = useQuery(
    ['users', user?.id, page + 1, rowsPerPage, search, department, role, filterStatus],
    () => userService.getUsers(queryParams),
    {
      keepPreviousData: true,
      enabled: !!user?.id && permissions.canViewAll
    }
  );

  const resetPasswordMutation = useMutation(
    ({ userId, newPassword }) => userService.resetPassword(userId, { newPassword }),
    {
      onMutate: () => {
        setLoading(true, '正在重置密码...');
      },
      onSuccess: () => {
        setResetPasswordDialogOpen(false);
        setSelectedUser(null);
        setNewPassword('');
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const createUserMutation = useMutation(
    (userData) => userService.createUser(userData),
    {
      onMutate: () => {
        setLoading(true, LOADING_MESSAGES.USER_CREATING);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['users', user?.id]);
        setCreateUserDialogOpen(false);
        setNewUser({
          username: '',
          password: '',
          name: '',
          role: '部员',
          department: '',
          email: '',
          phone: ''
        });
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const toggleStatusMutation = useMutation(
    (userId) => userService.toggleUserStatus(userId),
    {
      onMutate: () => {
        setLoading(true, '正在更新用户状态...');
      },
      onSuccess: () => {
        // 刷新用户列表查询
        queryClient.invalidateQueries(['users']);
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const updateUserMutation = useMutation(
    ({ userId, userData }) => userService.updateUser(userId, userData),
    {
      onMutate: () => {
        setLoading(true, LOADING_MESSAGES.USER_UPDATING);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['users', user?.id]);
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  if (!permissions.canViewAll) {
    return (
      <Box>
        <Typography variant="h6">没有权限访问用户管理</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  const users = usersData?.data?.users || [];
  const total = usersData?.data?.total || 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateUser = () => {
    if (newUser.username && newUser.password && newUser.name && newUser.role) {
      createUserMutation.mutate(newUser);
    }
  };

  const handleResetPassword = () => {
    if (selectedUser && newPassword) {
      resetPasswordMutation.mutate({
        userId: selectedUser._id,
        newPassword
      });
    }
  };

  const handleToggleActive = (userId) => {
    toggleStatusMutation.mutate(userId);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case '主席': return 'error';
      case '部长': return 'warning';
      case '部员': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          用户管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateUserDialogOpen(true)}
        >
          新建用户
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="搜索用户..."
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
                <InputLabel>职务</InputLabel>
                <Select
                  value={role}
                  label="职务"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <ToggleButtonGroup
                value={filterStatus}
                exclusive
                onChange={(e, v) => v && setFilterStatus(v)}
                size="small"
              >
                <ToggleButton value="active">活跃用户</ToggleButton>
                <ToggleButton value="pending">
                  待审核
                </ToggleButton>
                <ToggleButton value="all">全部</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearch('');
                  setDepartment('');
                  setRole('');
                  setFilterStatus('active');
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
              <TableCell>用户名</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>职务</TableCell>
              <TableCell>部门</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>手机</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>最后登录</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={user.role}
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell>{user.department || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  {user.status === 'pending' ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip size="small" label="待审核" color="warning" />
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleToggleActive(user._id)}
                      >
                        通过审核
                      </Button>
                    </Box>
                  ) : (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleToggleActive(user._id)}
                          size="small"
                        />
                      }
                      label={user.isActive ? '启用' : '禁用'}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {user.lastLogin
                    ? dayjs(user.lastLogin).format('YYYY-MM-DD HH:mm')
                    : '从未登录'
                  }
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedUser(user);
                      setResetPasswordDialogOpen(true);
                    }}
                    title="重置密码"
                  >
                    <Lock />
                  </IconButton>
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

      {/* 重置密码对话框 */}
      <Dialog
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>重置密码</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            为用户 "{selectedUser?.name}" 设置新密码
          </Typography>
          <TextField
            fullWidth
            label="新密码"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            helperText="密码至少6个字符"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={!newPassword || newPassword.length < 6 || resetPasswordMutation.isLoading}
          >
            {resetPasswordMutation.isLoading ? '重置中...' : '重置密码'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 创建用户对话框 */}
      <Dialog
        open={createUserDialogOpen}
        onClose={() => setCreateUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>创建新用户</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="用户名"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
                helperText="用户名用于登录，3-20个字符"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="密码"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                helperText="密码至少6个字符"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="姓名"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>职务</InputLabel>
                <Select
                  value={newUser.role}
                  label="职务"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {newUser.role !== '主席' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>部门</InputLabel>
                  <Select
                    value={newUser.department}
                    label="部门"
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="邮箱（选填）"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="手机号（选填）"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={
              !newUser.username ||
              !newUser.password ||
              !newUser.name ||
              !newUser.role ||
              (newUser.role !== '主席' && !newUser.department) ||
              createUserMutation.isLoading
            }
          >
            {createUserMutation.isLoading ? '创建中...' : '创建用户'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;