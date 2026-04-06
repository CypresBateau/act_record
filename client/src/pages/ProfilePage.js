import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import { Save, Lock, Person } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import LoadingButton from '../components/LoadingButton';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { setLoading } = useLoading();
  const [tabValue, setTabValue] = useState(0);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { register: profileRegister, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm();

  const updateProfileMutation = useMutation(updateProfile, {
    onMutate: () => {
      setLoading(true, '正在更新个人信息...');
    },
    onSuccess: () => {
      setProfileError('');
      setProfileSuccess('个人信息更新成功');
    },
    onError: (error) => {
      setProfileSuccess('');
      setProfileError(error.message || '更新失败');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const changePasswordMutation = useMutation(changePassword, {
    onMutate: () => {
      setLoading(true, '正在修改密码...');
    },
    onSuccess: () => {
      setPasswordError('');
      setPasswordSuccess('密码修改成功');
      resetPassword();
    },
    onError: (error) => {
      setPasswordSuccess('');
      setPasswordError(error.message || '密码修改失败');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const onSubmitProfile = (data) => {
    setProfileError('');
    setProfileSuccess('');
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data) => {
    setPasswordError('');
    setPasswordSuccess('');

    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('新密码和确认密码不匹配');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setProfileError('');
    setProfileSuccess('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        个人资料
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Person sx={{ fontSize: 48, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role} {user?.department && `• ${user?.department}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                用户名: {user?.username}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="基本信息" />
            <Tab label="修改密码" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>

              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {profileError}
                </Alert>
              )}

              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {profileSuccess}
                </Alert>
              )}

              <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...profileRegister('name', {
                        required: '请输入真实姓名',
                        maxLength: { value: 50, message: '姓名最多50个字符' }
                      })}
                      fullWidth
                      label="真实姓名"
                      error={!!profileErrors.name}
                      helperText={profileErrors.name?.message}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="用户名"
                      value={user?.username}
                      disabled
                      helperText="用户名不可修改"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...profileRegister('email', {
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: '请输入有效的邮箱地址'
                        }
                      })}
                      fullWidth
                      label="邮箱地址"
                      type="email"
                      error={!!profileErrors.email}
                      helperText={profileErrors.email?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...profileRegister('phone', {
                        pattern: {
                          value: /^1[3-9]\d{9}$/,
                          message: '请输入有效的手机号码'
                        }
                      })}
                      fullWidth
                      label="手机号码"
                      error={!!profileErrors.phone}
                      helperText={profileErrors.phone?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="职务"
                      value={user?.role}
                      disabled
                      helperText="职务由管理员设置"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="部门"
                      value={user?.department || '无'}
                      disabled
                      helperText="部门由管理员设置"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        loading={updateProfileMutation.isLoading}
                        loadingText="保存中..."
                      >
                        保存更改
                      </LoadingButton>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                修改密码
              </Typography>

              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}

              <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...passwordRegister('currentPassword', {
                        required: '请输入当前密码'
                      })}
                      fullWidth
                      label="当前密码"
                      type="password"
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} />
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...passwordRegister('newPassword', {
                        required: '请输入新密码',
                        minLength: { value: 6, message: '密码至少6个字符' }
                      })}
                      fullWidth
                      label="新密码"
                      type="password"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      {...passwordRegister('confirmPassword', {
                        required: '请确认新密码'
                      })}
                      fullWidth
                      label="确认新密码"
                      type="password"
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Lock />}
                        disabled={changePasswordMutation.isLoading}
                      >
                        {changePasswordMutation.isLoading ? '修改中...' : '修改密码'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;