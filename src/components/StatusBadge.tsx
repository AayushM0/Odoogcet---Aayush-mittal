interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    // Attendance statuses
    present: { bg: 'bg-green-100', text: 'text-green-800', label: 'Present' },
    absent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Absent' },
    'half-day': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Half-Day' },
    late: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Late' },
    
    // Leave statuses
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    
    // Payroll statuses
    draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
    finalized: { bg: 'bg-green-100', text: 'text-green-800', label: 'Finalized' },
  };

  const config = statusConfig[status.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: status,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold
        ${config.bg} ${config.text} ${sizeClasses[size]}
      `}
    >
      {config.label}
    </span>
  );
}
