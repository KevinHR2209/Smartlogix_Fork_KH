// frontend/src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'success';
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    secondary: "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};