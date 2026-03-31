import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  FormHelperText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Save, ArrowBack } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { activityService, DEPARTMENTS, ACTIVITY_FORMATS } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { LOADING_MESSAGES } from '../utils/apiWithLoading';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';

const CreateActivityPage = () => {
  const { permissions, user } = useAuth();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  // 等待权限加载完成 - 必须在任何使用 permissions 之前检查
  if (!user || !permissions.departments || permissions.departments.length === 0) {
    return <LoadingScreen />;
  }

  const availableDepartments = permissions.canEditAll
    ? DEPARTMENTS
    : permissions.departments;

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      startTime: dayjs(),
      endTime: dayjs().add(2, 'hour'),
      format: '线下',
      department: availableDepartments[0] || '',
      participants: { expected: 0 },
      budget: { planned: 0 }
    }
  });

  const createMutation = useMutation(activityService.createActivity, {
    onMutate: () => {
      setLoading(true, LOADING_MESSAGES.ACTIVITY_CREATING);
    },
    onSuccess: (response) => {
      // 刷新活动列表缓存，确保新建的活动立即显示
      queryClient.invalidateQueries(['activities', user?.id]);
      queryClient.invalidateQueries(['activity-stats', user?.id]);
      queryClient.invalidateQueries(['recent-activities', user?.id]);
      navigate(`/activities/${response.data.activity._id}`);
    },
    onError: (error) => {
      setError(error.response?.data?.message || '创建活动失败');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const onSubmit = (data) => {
    setError('');

    const submitData = {
      ...data,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
    };

    createMutation.mutate(submitData);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/activities')}
          sx={{ mr: 2 }}
        >
          返回
        </Button>
        <Typography variant="h4" component="h1">
          新建活动
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    基本信息
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        {...register('title', {
                          required: '请输入活动名称',
                          maxLength: { value: 100, message: '活动名称最多100个字符' }
                        })}
                        fullWidth
                        label="活动名称"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('description', {
                          required: '请输入活动描述',
                          maxLength: { value: 2000, message: '活动描述最多2000个字符' }
                        })}
                        fullWidth
                        label="活动描述"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required error={!!errors.department}>
                        <InputLabel id="department-label">负责部门</InputLabel>
                        <Controller
                          name="department"
                          control={control}
                          rules={{ required: '请选择负责部门' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="department-label"
                              label="负责部门"
                              value={field.value || ''}
                            >
                              {availableDepartments && availableDepartments.length > 0 ? (
                                availableDepartments.map((dept) => (
                                  <MenuItem key={dept} value={dept}>
                                    {dept}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem value="" disabled>
                                  没有可用部门
                                </MenuItem>
                              )}
                            </Select>
                          )}
                        />
                        {errors.department && (
                          <FormHelperText>{errors.department.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required error={!!errors.format}>
                        <InputLabel>活动形式</InputLabel>
                        <Controller
                          name="format"
                          control={control}
                          rules={{ required: '请选择活动形式' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label="活动形式"
                            >
                              {ACTIVITY_FORMATS.map((format) => (
                                <MenuItem key={format} value={format}>
                                  {format}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.format && (
                          <FormHelperText>{errors.format.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    时间地点
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="startTime"
                        control={control}
                        rules={{ required: '请选择开始时间' }}
                        render={({ field }) => (
                          <DateTimePicker
                            {...field}
                            label="开始时间"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                error: !!errors.startTime,
                                helperText: errors.startTime?.message
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="endTime"
                        control={control}
                        rules={{
                          required: '请选择结束时间',
                          validate: (value) => {
                            const startTime = watch('startTime');
                            return dayjs(value).isAfter(startTime) || '结束时间必须晚于开始时间';
                          }
                        }}
                        render={({ field }) => (
                          <DateTimePicker
                            {...field}
                            label="结束时间"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                error: !!errors.endTime,
                                helperText: errors.endTime?.message
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('location', {
                          required: '请输入活动地点',
                          maxLength: { value: 200, message: '活动地点最多200个字符' }
                        })}
                        fullWidth
                        label="活动地点"
                        error={!!errors.location}
                        helperText={errors.location?.message}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    其他信息
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        {...register('participants.expected', {
                          min: { value: 0, message: '预期参与人数不能为负数' }
                        })}
                        fullWidth
                        label="预期参与人数"
                        type="number"
                        error={!!errors.participants?.expected}
                        helperText={errors.participants?.expected?.message}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        {...register('budget.planned', {
                          min: { value: 0, message: '预算金额不能为负数' }
                        })}
                        fullWidth
                        label="预算金额 (元)"
                        type="number"
                        error={!!errors.budget?.planned}
                        helperText={errors.budget?.planned?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('promotionContent', {
                          maxLength: { value: 5000, message: '宣传内容最多5000个字符' }
                        })}
                        fullWidth
                        label="宣传内容"
                        multiline
                        rows={4}
                        placeholder="请输入活动宣传文案..."
                        error={!!errors.promotionContent}
                        helperText={errors.promotionContent?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('tags')}
                        fullWidth
                        label="标签"
                        placeholder="请输入标签，用逗号分隔"
                        helperText="例如：学术交流，讲座，线上活动"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/activities')}
                >
                  取消
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  loading={createMutation.isLoading}
                  loadingText="创建中..."
                >
                  创建活动
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateActivityPage;