import React, { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Tech Stack', href: '#tech-stack' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Team', href: '#team' },
    { name: 'Contact', href: '#contact' },
  ];

  const headerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 50,
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const logoIconStyle: React.CSSProperties = {
    backgroundColor: '#22c55e',
    padding: '0.5rem',
    borderRadius: '0.5rem',
  };

  const desktopNavStyle: React.CSSProperties = {
    display: 'none',
    gap: '2rem',
  };

  const linkStyle: React.CSSProperties = {
    color: '#374151',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s',
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <nav style={navStyle}>
          {/* Logo */}
          <div style={logoStyle}>
            <div style={logoIconStyle}>
              <Leaf style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
              GrowMateAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{ ...desktopNavStyle, display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                style={linkStyle}
                onMouseOver={(e) => (e.target as HTMLElement).style.color = '#22c55e'}
                onMouseOut={(e) => (e.target as HTMLElement).style.color = '#374151'}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{
              display: window.innerWidth >= 768 ? 'none' : 'block',
              padding: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X style={{ height: '1.5rem', width: '1.5rem', color: '#374151' }} />
            ) : (
              <Menu style={{ height: '1.5rem', width: '1.5rem', color: '#374151' }} />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav style={{ padding: '1rem 0', borderTop: '1px solid #e5e7eb' }}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '0.5rem 0',
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onClick={() => setIsMenuOpen(false)}
                onMouseOver={(e) => (e.target as HTMLElement).style.color = '#22c55e'}
                onMouseOut={(e) => (e.target as HTMLElement).style.color = '#374151'}
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
