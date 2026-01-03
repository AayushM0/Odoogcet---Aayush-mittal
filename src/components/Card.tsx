interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  color = 'primary',
  className = ''
}: {
  title: string;
  value: string | number;
  icon?: string;
  subtitle?: string;
  color?: 'primary' | 'green' | 'blue' | 'orange' | 'red' | 'yellow' | 'purple';
  className?: string;
}) {
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const textColorClasses = {
    primary: 'text-primary-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0">
              <div className={`rounded-md ${colorClasses[color]} p-3`}>
                <span className="text-2xl">{icon}</span>
              </div>
            </div>
          )}
          <div className={icon ? 'ml-5 w-0 flex-1' : 'w-full'}>
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className={`text-3xl font-semibold ${textColorClasses[color]}`}>{value}</dd>
              {subtitle && <dd className="text-xs text-gray-500 mt-1">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
