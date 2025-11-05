import React from 'react';

const Select = React.forwardRef(({ 
  className = '', 
  children,
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  
  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none bg-white';
  
  const stateStyles = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500';
  
  const disabledStyles = disabled 
    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
    : '';
  
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = 'Select';

export { Select };