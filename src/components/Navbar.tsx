import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://www.5degres.com/wp-content/uploads/2024/02/5D-Logo-2.jpeg.png" 
              alt="Cinq Degrés" 
              className="h-8"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;