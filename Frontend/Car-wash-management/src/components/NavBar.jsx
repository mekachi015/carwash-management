export function Navbar({ currentPage, onNavigate }) {
  const links = [
    { id: 'public',  label: 'Public'   },
    { id: 'status',  label: 'Status'   },
    { id: 'pay',     label: 'Payment'  },
    { id: 'owner',   label: 'Owner'    },
    { id: 'staff',   label: 'Staff'    },
  ];

  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-brand">☀️ <span>ShineCo</span></div>
        <div className="nav-links">
          {links.map(link => (
            <a
              key={link.id}
              href="#"
              className={currentPage === link.id ? 'active' : ''}
              onClick={e => { e.preventDefault(); onNavigate(link.id); }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;