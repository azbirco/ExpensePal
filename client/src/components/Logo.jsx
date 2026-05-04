import React from 'react';
import ExpensePalLogo from '../assets/expensepal_logo-removebg-preview.png'; 

const Logo = ({ className = "w-64" }) => (
  <div className={`flex items-center justify-center transition-all duration-300 ${className}`}>
    <img 
      src={ExpensePalLogo} 
      alt="ExpensePal Logo" 
      className="w-full h-auto object-contain drop-shadow-2xl" 
    />
  </div>
);

export default Logo;