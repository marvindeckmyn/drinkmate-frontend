import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
  };

  return (
    <div className="main">
      <div className="admin-dashboard">
        <h1>{t('AdminDashboard.title')}</h1>
        <div className="admin-navigation">
          <button onClick={() => handleNavigation('general')}>{t('AdminDashboard.general')}</button>
          <button onClick={() => handleNavigation('categories')}>{t('AdminDashboard.categories')}</button>
          <button onClick={() => handleNavigation('games')}>{t('AdminDashboard.games')}</button>
          <button onClick={() => handleNavigation('submitted-games')}>{t('AdminDashboard.submittedGames')}</button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;