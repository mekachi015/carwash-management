import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: '',       label: 'Home'  },
    { id: 'status', label: 'Status'  },
    { id: 'payment',    label: 'Payment' },
    { id: 'owner',  label: 'Owner'   },
    { id: 'staff',  label: 'Staff'   },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-brand"><span>The Clinic Car Wash</span></div>
        
        {/* Hamburger Icon (Visible only on mobile) */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <div className={`hamburger ${isOpen ? 'open' : ''}`}></div>
        </button>

        <div className={`nav-links ${isOpen ? 'show' : ''}`}>
          {links.map(link => (
            <NavLink
              key={link.id}
              to={`/${link.id}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setIsOpen(false)} // Close menu when a link is clicked
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;