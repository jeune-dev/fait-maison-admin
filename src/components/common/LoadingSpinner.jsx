import { memo } from 'react';

const LoadingSpinner = memo(function LoadingSpinner({ fullPage = false, small = false }) {
  const spinner = <div className={small ? 'spinner spinner-sm' : 'spinner'} />;

  if (fullPage) {
    return <div className="loading-full">{spinner}</div>;
  }

  return <div className="loading-center">{spinner}</div>;
});

export default LoadingSpinner;
