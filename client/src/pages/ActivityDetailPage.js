import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  Download,
  Upload,
  AttachFile,
  Description,
  Photo,
  Receipt,
  CloudDownload
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';

import { activityService, fileService, EXPENSE_CATEGORIES, FILE_CATEGORIES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { LOADING_MESSAGES } from '../utils/apiWithLoading';
import LoadingScreen from '../components/LoadingScreen';

const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { permissions, user } = useAuth();
  const { setLoading } = useLoading();
  const queryClient = useQueryClient();

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileCategory, setFileCategory] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

  const { data: activityData, isLoading } = useQuery(
    ['activity', user?.id, id],
    () => activityService.getActivity(id),
    {
      enabled: !!user?.id && !!id
    }
  );

  const { data: filesData } = useQuery(
    ['activity-files', user?.id, id],
    () => fileService.getFiles(id),
    {
      enabled: !!user?.id && !!id
    }
  );

  const addExpenseMutation = useMutation(
    (expenseData) => activityService.addExpense(id, expenseData),
    {
      onMutate: () => {
        setLoading(true, LOADING_MESSAGES.EXPENSE_CREATING);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['activity', user?.id, id]);
        setExpenseDialogOpen(false);
        reset();
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const deleteExpenseMutation = useMutation(
    (expenseId) => activityService.deleteExpense(id, expenseId),
    {
      onMutate: () => {
        setLoading(true, LOADING_MESSAGES.EXPENSE_DELETING);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['activity', user?.id, id]);
        setDeleteExpenseDialogOpen(false);
        setSelectedExpense(null);
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const uploadFileMutation = useMutation(
    (fileData) => {
      console.log('开始上传文件:', fileData);
      return fileService.uploadFile(id, fileData);
    },
    {
      onMutate: () => {
        console.log('文件上传 mutation 开始');
        setLoading(true, LOADING_MESSAGES.FILE_UPLOADING);
      },
      onSuccess: (response) => {
        console.log('文件上传成功:', response);

        // 异步关闭对话框和清理状态
        setTimeout(() => {
          setUploadDialogOpen(false);
          setSelectedFiles([]);
          setFileCategory('');
          setFileDescription('');
          alert('文件上传成功！');
        }, 100);

        // 异步刷新文件列表，避免阻塞
        setTimeout(() => {
          queryClient.invalidateQueries(['activity-files', user?.id, id]);
        }, 50);
      },
      onError: (error) => {
        console.error('文件上传失败:', error);
        const errorMessage = error.response?.data?.message || '文件上传失败';
        alert(errorMessage);
      },
      onSettled: () => {
        console.log('文件上传 mutation 结束');
        // 确保加载状态被关闭
        setLoading(false);
      }
    }
  );

  const deleteFileMutation = useMutation(
    (fileId) => fileService.deleteFile(id, fileId),
    {
      onMutate: () => {
        setLoading(true, LOADING_MESSAGES.FILE_DELETING);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['activity-files', user?.id, id]);
        setDeleteFileDialogOpen(false);
        setSelectedFile(null);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || '文件删除失败';
        alert(errorMessage);
      },
      onSettled: () => {
        setLoading(false);
      }
    }
  );

  const handleFileUpload = () => {
    if (selectedFiles.length === 0) {
      alert('请选择文件');
      return;
    }
    if (!fileCategory) {
      alert('请选择文件分类');
      return;
    }

    // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
    const maxSize = 10 * 1024 * 1024;
    if (selectedFiles[0].size > maxSize) {
      alert(`文件太大！最大支持 10MB，当前文件大小: ${(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    uploadFileMutation.mutate({
      file: selectedFiles[0],
      category: fileCategory,
      description: fileDescription
    });
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const downloadFile = async (fileId, filename) => {
    try {
      setLoading(true, LOADING_MESSAGES.FILE_DOWNLOADING);
      const response = await fileService.downloadFile(id, fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = (file) => {
    setSelectedFile(file);
    setDeleteFileDialogOpen(true);
  };

  const confirmDeleteFile = () => {
    if (selectedFile) {
      deleteFileMutation.mutate(selectedFile._id);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const activity = activityData?.data?.activity;
  const files = filesData?.data?.files || [];

  if (!activity) {
    return (
      <Box>
        <Typography variant="h6">活动不存在</Typography>
      </Box>
    );
  }

  const canEdit = permissions.canEditAll ||
                 permissions.departments.includes(activity.department);

  const getStatusColor = (status) => {
    switch (status) {
      case '已完成': return 'success';
      case '进行中': return 'primary';
      case '计划中': return 'warning';
      case '已取消': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case '活动文件': return <Description />;
      case '宣传文案': return <Description />;
      case '照片记录': return <Photo />;
      case '报销凭证': return <Receipt />;
      default: return <AttachFile />;
    }
  };

  const onSubmitExpense = (data) => {
    addExpenseMutation.mutate({
      ...data,
      amount: parseFloat(data.amount)
    });
  };

  const totalExpenses = activity.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/activities')}
            sx={{ mr: 2 }}
          >
            返回
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              {activity.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip
                size="small"
                label={activity.status}
                color={getStatusColor(activity.status)}
              />
              <Typography variant="body2" color="text.secondary">
                {activity.department} • {activity.format}
              </Typography>
            </Box>
          </Box>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/activities/${id}/edit`)}
          >
            编辑
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              活动详情
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" paragraph>
                  {activity.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  开始时间
                </Typography>
                <Typography variant="body1">
                  {dayjs(activity.startTime).format('YYYY-MM-DD HH:mm')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  结束时间
                </Typography>
                <Typography variant="body1">
                  {dayjs(activity.endTime).format('YYYY-MM-DD HH:mm')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  活动地点
                </Typography>
                <Typography variant="body1">
                  {activity.location}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  组织者
                </Typography>
                <Typography variant="body1">
                  {activity.organizer?.name} ({activity.organizer?.department})
                </Typography>
              </Grid>
              {activity.tags && activity.tags.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    标签
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {activity.tags.map((tag, index) => (
                      <Chip key={index} size="small" label={tag} variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {activity.promotionContent && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                宣传内容
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {activity.promotionContent}
              </Typography>
            </Paper>
          )}

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                开销记录
              </Typography>
              {canEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setExpenseDialogOpen(true)}
                >
                  添加开销
                </Button>
              )}
            </Box>
            {activity.expenses && activity.expenses.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>项目</TableCell>
                      <TableCell>分类</TableCell>
                      <TableCell align="right">金额</TableCell>
                      <TableCell>描述</TableCell>
                      <TableCell>提交人</TableCell>
                      <TableCell>提交时间</TableCell>
                      {canEdit && <TableCell>操作</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activity.expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>{expense.item}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell align="right">¥{expense.amount.toLocaleString()}</TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell>{expense.submittedBy?.name || '未知'}</TableCell>
                        <TableCell>
                          {expense.submittedAt
                            ? dayjs(expense.submittedAt).format('YYYY-MM-DD HH:mm')
                            : '-'
                          }
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setDeleteExpenseDialogOpen(true);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}><strong>总计</strong></TableCell>
                      <TableCell align="right">
                        <strong>¥{totalExpenses.toLocaleString()}</strong>
                      </TableCell>
                      <TableCell colSpan={canEdit ? 2 : 1} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                暂无开销记录
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                相关文件
              </Typography>
              {canEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload />}
                  onClick={() => setUploadDialogOpen(true)}
                >
                  上传文件
                </Button>
              )}
            </Box>
            {files.length > 0 ? (
              <List>
                {files.map((file) => (
                  <ListItem key={file._id} divider>
                    <ListItemIcon>
                      {getCategoryIcon(file.category)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.originalName}
                      secondary={`${file.category} • ${(file.size / 1024 / 1024).toFixed(2)} MB • 上传者: ${file.uploadedBy?.name || '未知'} • 上传时间: ${file.uploadedAt ? dayjs(file.uploadedAt).format('YYYY-MM-DD HH:mm') : '-'}`}
                    />
                    <Box>
                      <Tooltip title="下载文件">
                        <IconButton
                          onClick={() => downloadFile(file._id, file.originalName)}
                        >
                          <CloudDownload />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="删除文件">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFile(file)}
                            disabled={deleteFileMutation.isLoading}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                暂无相关文件
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              参与情况
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                预期参与人数
              </Typography>
              <Typography variant="h4">
                {activity.participants?.expected || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                实际参与人数
              </Typography>
              <Typography variant="h4">
                {activity.participants?.actual || '-'}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              预算情况
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                计划预算
              </Typography>
              <Typography variant="h5">
                ¥{(activity.budget?.planned || 0).toLocaleString()}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                实际支出
              </Typography>
              <Typography variant="h5">
                ¥{totalExpenses.toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                预算状态
              </Typography>
              <Typography
                variant="body1"
                color={totalExpenses > (activity.budget?.planned || 0) ? 'error' : 'success'}
                fontWeight="bold"
              >
                {totalExpenses > (activity.budget?.planned || 0) ? '超出预算' : '预算内'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 添加开销对话框 */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加开销记录</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitExpense)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  {...register('item', { required: '请输入开销项目' })}
                  fullWidth
                  label="开销项目"
                  error={!!errors.item}
                  helperText={errors.item?.message}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('amount', {
                    required: '请输入金额',
                    min: { value: 0.01, message: '金额必须大于0' }
                  })}
                  fullWidth
                  label="金额 (元)"
                  type="number"
                  step="0.01"
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel>分类</InputLabel>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: '请选择分类' }}
                    render={({ field }) => (
                      <Select {...field} label="分类">
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('description')}
                  fullWidth
                  label="描述"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpenseDialogOpen(false)}>
              取消
            </Button>
            <Button type="submit" variant="contained" disabled={addExpenseMutation.isLoading}>
              添加
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 删除开销确认对话框 */}
      <Dialog open={deleteExpenseDialogOpen} onClose={() => setDeleteExpenseDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          确定要删除开销记录 "{selectedExpense?.item}" 吗？
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteExpenseDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={() => deleteExpenseMutation.mutate(selectedExpense._id)}
            color="error"
            disabled={deleteExpenseMutation.isLoading}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 上传文件对话框 */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>上传文件</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>文件分类</InputLabel>
                <Select
                  value={fileCategory}
                  label="文件分类"
                  onChange={(e) => setFileCategory(e.target.value)}
                >
                  {FILE_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="文件描述"
                multiline
                rows={2}
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="选填：说明文件用途..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AttachFile />}
              >
                选择文件
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp4"
                />
              </Button>
              {selectedFiles.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  已选择: {selectedFiles[0].name} ({(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={uploadFileMutation.isLoading || selectedFiles.length === 0 || !fileCategory}
          >
            {uploadFileMutation.isLoading ? '上传中...' : '上传'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除文件确认对话框 */}
      <Dialog open={deleteFileDialogOpen} onClose={() => setDeleteFileDialogOpen(false)}>
        <DialogTitle>确认删除文件</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            删除后无法恢复，请谨慎操作！
          </Alert>
          <Typography>
            确定要删除文件 "{selectedFile?.originalName}" 吗？
          </Typography>
          {selectedFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              文件大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              <br />
              上传时间: {selectedFile.uploadedAt ? dayjs(selectedFile.uploadedAt).format('YYYY-MM-DD HH:mm') : '-'}
              <br />
              上传者: {selectedFile.uploadedBy?.name || '未知'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFileDialogOpen(false)} disabled={deleteFileMutation.isLoading}>
            取消
          </Button>
          <Button
            onClick={confirmDeleteFile}
            color="error"
            variant="contained"
            disabled={deleteFileMutation.isLoading}
          >
            {deleteFileMutation.isLoading ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityDetailPage;