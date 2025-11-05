import React from 'react';

const Textarea = React.forwardRef(({ 
  className = '', 
  error = false,
  disabled = false,
  rows = 4,
  ...props 
}, ref) => {
  
  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none';
  
  const stateStyles = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500';
  
  const disabledStyles = disabled 
    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
    : 'bg-white';
  
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };