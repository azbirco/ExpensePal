import React from 'react';
import ExpensePalLogo from '../assets/expensepal_logo-removebg-preview.png'; 

const Logo = ({ className = "w-72" }) => (
  <div className={`flex items-center justify-center transition-all duration-300 ${className}`}>
    <img 
      src={ExpensePalLogo} 
      alt="ExpensePal Logo" 
      className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
    />
  </div>
);

export default Logo;