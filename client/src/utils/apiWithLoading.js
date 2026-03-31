import { useLoading } from '../contexts/LoadingContext';

// 为API请求添加加载状态的Hook
export const useApiWithLoading = () => {
  const { setLoading, clearLoading } = useLoading();

  const withLoading = async (apiCall, loadingMessage = '加载中...') => {
    try {
      setLoading(true, loadingMessage);
      const result = await apiCall();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const withLoadingMessage = async (apiCall, message) => {
    return withLoading(apiCall, message);
  };

  return { withLoading, withLoadingMessage };
};

// 为Mutation添加加载状态的Hook
export const useMutationWithLoading = (mutationFn, options = {}) => {
  const { setLoading } = useLoading();

  const enhancedMutation = {
    mutate: async (variables, mutationOptions) => {
      const loadingMessage = options.loadingMessage || '处理中...';
      try {
        setLoading(true, loadingMessage);

        // 调用原始的mutation函数
        const result = await mutationFn(variables);

        // 调用成功回调
        if (options.onSuccess) {
          options.onSuccess(result, variables);
        }

        return result;
      } catch (error) {
        // 调用错误回调
        if (options.onError) {
          options.onError(error, variables);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    isLoading: false
  };

  return enhancedMutation;
};

// 预定义的加载消息
export const LOADING_MESSAGES = {
  // 活动相关
  ACTIVITY_LOADING: '正在加载活动数据...',
  ACTIVITY_CREATING: '正在创建活动...',
  ACTIVITY_UPDATING: '正在更新活动...',
  ACTIVITY_DELETING: '正在删除活动...',

  // 文件相关
  FILE_UPLOADING: '正在上传文件...',
  FILE_DOWNLOADING: '���在下载文件...',
  FILE_DELETING: '正在删除文件...',

  // 用户相关
  USER_LOADING: '正在加载用户数据...',
  USER_CREATING: '正在创建用户...',
  USER_UPDATING: '正在更新用户信息...',

  // 费用相关
  EXPENSE_CREATING: '正在添加开销记录...',
  EXPENSE_UPDATING: '正在更新开销记录...',
  EXPENSE_DELETING: '正在删除开销记录...',

  // 通用
  SAVING: '正在保存...',
  LOADING: '正在加载...',
  DELETING: '正在删除...',
  SUBMITTING: '正在提交...'
};

export default {
  useApiWithLoading,
  useMutationWithLoading,
  LOADING_MESSAGES
};