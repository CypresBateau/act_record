import React, { useState, useEffect } from 'react';
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
import { useQuery, useMutation } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { activityService, DEPARTMENTS, ACTIVITY_FORMATS, ACTIVITY_STATUS } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { LOADING_MESSAGES } from '../utils/apiWithLoading';
import LoadingScreen from '../components/LoadingScreen';
import LoadingButton from '../components/LoadingButton';

const EditActivityPage = () => {
  const { id } = useParams();
  const { permissions } = useAuth();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [error, setError] = useState('');

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm();

  const { data: activityData, isLoading } = useQuery(
    ['activity', id],
    () => activityService.getActivity(id)
  );

  const updateMutation = useMutation(
    (data) => activityService.updateActivity(id, data),
    {
      onMutate: () => {
        setLoading(true, LOADING_MESSAGES.ACTIVITY_UPDATING);
      },
      onSuccess: () => {
        navigate(`/activities/${id}`);
      },
      onError: (error) => {
        setError(error.response?.data?.message || '更新活动失败');
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const activity = activityData?.data?.activity;

  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title,
        description: activity.description,
        department: activity.department,
        startTime: dayjs(activity.startTime),
        endTime: dayjs(activity.endTime),
        location: activity.location,
        format: activity.format,
        status: activity.status,
        participants: activity.participants || { expected: 0, actual: 0 },
        budget: activity.budget || { planned: 0 },
        promotionContent: activity.promotionContent || '',
        summary: activity.summary || '',
        tags: activity.tags?.join(', ') || ''
      });
    }
  }, [activity, reset]);

  const onSubmit = (data) => {
    setError('');

    const submitData = {
      ...data,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
    };

    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!activity) {
    return (
      <Box>
        <Typography variant="h6">活动不存在</Typography>
      </Box>
    );
  }

  const canEdit = permissions.canEditAll ||
                 permissions.departments.includes(activity.department);

  if (!canEdit) {
    return (
      <Box>
        <Typography variant="h6">没有权限编辑此活动</Typography>
      </Box>
    );
  }

  const availableDepartments = permissions.canEditAll
    ? DEPARTMENTS
    : permissions.departments;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/activities/${id}`)}
          sx={{ mr: 2 }}
        >
          返回
        </Button>
        <Typography variant="h4" component="h1">
          编辑活动
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
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth required error={!!errors.department}>
                        <InputLabel>负责部门</InputLabel>
                        <Controller
                          name="department"
                          control={control}
                          rules={{ required: '请选择负责部门' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label="负责部门"
                              disabled={!permissions.canEditAll}
                            >
                              {availableDepartments.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                  {dept}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.department && (
                          <FormHelperText>{errors.department.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth required error={!!errors.status}>
                        <InputLabel>活动状态</InputLabel>
                        <Controller
                          name="status"
                          control={control}
                          rules={{ required: '请选择活动状态' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label="活动状态"
                            >
                              {ACTIVITY_STATUS.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.status && (
                          <FormHelperText>{errors.status.message}</FormHelperText>
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
                    参与和预算
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
                        {...register('participants.actual', {
                          min: { value: 0, message: '实际参与人数不能为负数' }
                        })}
                        fullWidth
                        label="实际参与人数"
                        type="number"
                        error={!!errors.participants?.actual}
                        helperText={errors.participants?.actual?.message}
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
                        {...register('summary', {
                          maxLength: { value: 2000, message: '活动总结最多2000个字符' }
                        })}
                        fullWidth
                        label="活动总结"
                        multiline
                        rows={4}
                        placeholder="请输入活动总结..."
                        error={!!errors.summary}
                        helperText={errors.summary?.message}
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
                  onClick={() => navigate(`/activities/${id}`)}
                >
                  取消
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  loading={updateMutation.isLoading}
                  loadingText="保存中..."
                >
                  保存更改
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditActivityPage;