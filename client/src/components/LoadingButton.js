import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';

const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  loadingText = '提交中...',
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : props.startIcon}
    >
      {loading ? loadingText : children}
    </Button>
  );
};

export default LoadingButton;