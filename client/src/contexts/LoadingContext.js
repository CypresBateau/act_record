import React, { createContext, useContext, useState, useCallback } from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: '加载中...',
    operationCount: 0
  });

  const setLoading = useCallback((isLoading, message = '加载中...') => {
    setLoadingState(prev => {
      const newOperationCount = isLoading
        ? prev.operationCount + 1
        : Math.max(0, prev.operationCount - 1);

      return {
        isLoading: newOperationCount > 0,
        message: newOperationCount > 0 ? message : '加载中...',
        operationCount: newOperationCount
      };
    });

    // 超时保护：如果有操作计数但状态显示为加载，30秒后自动关闭
    if (isLoading) {
      setTimeout(() => {
        setLoadingState(prevState => {
          if (prevState.isLoading && prevState.operationCount > 0) {
            console.warn('Loading state timeout: forcing clear');
            return {
              isLoading: false,
              message: '加载中...',
              operationCount: 0
            };
          }
          return prevState;
        });
      }, 30000); // 30秒超时
    }
  }, []);

  const setLoadingWithMessage = useCallback((message) => {
    setLoading(true, message);
  }, [setLoading]);

  const clearLoading = useCallback(() => {
    console.log('手动清除加载状态');
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      operationCount: 0
    }));
  }, []);

  // 添加全局调试函数（开发环境）
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.forceClearLoading = clearLoading;
  }

  return (
    <LoadingContext.Provider value={{
      loadingState,
      setLoading,
      setLoadingWithMessage,
      clearLoading
    }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }}
        open={loadingState.isLoading}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} thickness={4} />
          <Typography variant="h6" component="div">
            {loadingState.message}
          </Typography>
          {loadingState.operationCount > 1 && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              正在处理 {loadingState.operationCount} 个操作...
            </Typography>
          )}
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;