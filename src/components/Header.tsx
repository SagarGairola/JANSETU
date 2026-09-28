import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../context';
import { Button } from './Button';

export const Header: React.FC = () => {
  const { resetDemo } = useDemo();
  const navigate = useNavigate();

  const handleReset = () => {
    resetDemo();
    navigate('/');
  };

  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <Link to="/" className="brand-group" style={{ textDecoration: 'none' }}>
          <div className="brand-badge">जन-SETU</div>
          <div className="brand-meta">
            <span className="brand-title">JANSETU</span>
            <span className="brand-tagline">Application Readiness Engine for Government Schemes</span>
          </div>
        </Link>
        <div className="header-actions">
          <Button variant="outline" size="sm" onClick={handleReset} aria-label="Reset prototype demo">
            Restart Demo
          </Button>
        </div>
      </div>
    </header>
  );
};
