import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Container,
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

import { useAuth } from '../contexts/AuthContext';
import { DEPARTMENTS, ROLES } from '../services/api';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm();
  const watchRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await registerUser(data);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <School fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" gutterBottom>
          校研会活动管理
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          用户注册
        </Typography>

        <Card sx={{ mt: 3, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('username', {
                  required: '请输入学号',
                  minLength: { value: 3, message: '用户名至少3个字符' },
                  maxLength: { value: 20, message: '用户名最多20个字符' }
                })}
                margin="normal"
                required
                fullWidth
                id="username"
                label="学号"
                autoComplete="username"
                autoFocus
                error={!!errors.username}
                helperText={errors.username?.message}
              />

              <TextField
                {...register('name', {
                  required: '请输入真实姓名',
                  maxLength: { value: 50, message: '姓名最多50个字符' }
                })}
                margin="normal"
                required
                fullWidth
                id="name"
                label="真实姓名"
                autoComplete="name"
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                {...register('password', {
                  required: '请输入密码',
                  minLength: { value: 6, message: '密码至少6个字符' }
                })}
                margin="normal"
                required
                fullWidth
                name="password"
                label="密码"
                type="password"
                id="password"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <FormControl fullWidth margin="normal" required error={!!errors.role}>
                <InputLabel id="role-label">角色</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: '请选择角色' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="role-label"
                      label="角色"
                    >
                      {ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
              </FormControl>

              {watchRole && watchRole !== '主席' && (
                <FormControl fullWidth margin="normal" required error={!!errors.department}>
                  <InputLabel id="department-label">部门</InputLabel>
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: '请选择部门' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="department-label"
                        label="部门"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.department && <FormHelperText>{errors.department.message}</FormHelperText>}
                </FormControl>
              )}

              <TextField
                {...register('email', {
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: '请输入有效的邮箱地址'
                  }
                })}
                margin="normal"
                fullWidth
                id="email"
                label="邮箱地址（可选）"
                type="email"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                {...register('phone', {
                  pattern: {
                    value: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号码'
                  }
                })}
                margin="normal"
                fullWidth
                id="phone"
                label="手机号码（可选）"
                autoComplete="tel"
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '注册'}
              </Button>

              <Box textAlign="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  已有账户？立即登录
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RegisterPage;