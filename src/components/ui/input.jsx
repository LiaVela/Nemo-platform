import React from 'react';

const Input = React.forwardRef(({ 
  className = '', 
  type = 'text',
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  
  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const stateStyles = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500';
  
  const disabledStyles = disabled 
    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
    : 'bg-white';
  
  return (
    <input
      ref={ref}
      type={type}
      className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };