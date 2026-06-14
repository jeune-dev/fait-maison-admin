import { memo } from 'react';
const Badge = memo(function Badge({ variant = 'default', children }) {
  const cls = { success: 'badge badge-success', danger: 'badge badge-danger', warning: 'badge badge-warning', info: 'badge badge-info', default: 'badge badge-default' }[variant] || 'badge badge-default';
  return <span className={cls}>{children}</span>;
});
export default Badge;
