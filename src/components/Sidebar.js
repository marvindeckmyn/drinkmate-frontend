import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';
import MobileNavbar from './MobileNavbar';

const Sidebar = ({ isAdmin, isLoggedIn, handleLogout }) => {
  const { t } = useTranslation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 767);
  
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarVisible(window.innerWidth > 767);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
    {window.innerWidth <= 767 && (
      <MobileNavbar isAdmin={isAdmin} isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
    )}

      {isSidebarVisible && (
        <nav className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <h1>DrinkMate</h1>
        <ul>
          <li>
            <NavLink to="/games">{t('Sidebar.games')}</NavLink>
          </li>
          {isAdmin && (
              <li>
                <NavLink to="/admin/general">{t('Sidebar.adminDashboard')}</NavLink>
              </li>
            )}
          <li>
            <NavLink to="/submit-game">{t('Sidebar.submitAGame')}</NavLink>
          </li>
          {isLoggedIn ? (
            <li>
              <button className="logout-button" onClick={handleLogout}>
                {t('Sidebar.logout')}
              </button>
            </li>
          ) : (
            <li>
              <NavLink to="/login">{t('Sidebar.login')}</NavLink>
            </li>
          )}
        </ul>

        <div className="bottom-elements">
          <img src="/logo512.png" alt="Your Logo" className="logo" />
          <LanguageSwitcher />
          <Footer />
        </div>
      </nav>
      )}
    </>
  );
};

export default Sidebar;