import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import GameList from './components/GameList';
import Register from './components/Register';
import Login from './components/Login';
import SubmitGame from './components/SubmitGame';
import AdminDashboard from './components/AdminDashboard';
import Sidebar from './components/Sidebar';
import ManageCategories from './components/admin/ManageCategories';
import ManageGames from './components/admin/ManageGames';
import ManageUserSubmittedGames from './components/admin/ManageUserSubmittedGames';
import SubmittedGameDetail from './components/admin/SubmittedGameDetail';
import AdminGeneral from './components/admin/AdminGeneral';
import GameDetails from './components/GameDetails';
import Header from './components/Header';
import DiceRoller from './components/DiceRoller';
import './scss/main.scss';
import { useTranslation } from 'react-i18next';

function App({ router: Router = BrowserRouter}) {
  const initialToken = localStorage.getItem('authToken') || '';
  
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(initialToken);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const { t } = useTranslation();

  //tijdelijke notificatie bitch

  useEffect(() => {
    if (!localStorage.getItem('notificationShown')) {
      setShowNotification(true);
    }
  }, []);

  const handleNotificationClose = () => {
    localStorage.setItem('notificationShown', 'true');
    setShowNotification(false);
};

useEffect(() => {
  const expiryDate = new Date('2023-08-27');
  const currentDate = new Date();
  
  if (currentDate < expiryDate && !localStorage.getItem('notificationShown')) {
      setShowNotification(true);
  }
}, []);

  const handleLogin = useCallback((userId, isAdmin) => {
    setCurrentUserId(userId);
    setIsAdmin(isAdmin);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${config.API_BASE_URL}/api/users/logout`);
      localStorage.removeItem('authToken');
      setAuthToken(null);
      setCurrentUserId(null);
      setIsAdmin(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/users/me`, {
        headers: {
          'x-auth-token': authToken,
        },
      });
      setCurrentUserId(response.data.id);
      setIsAdmin(response.data.is_admin);
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 401) {
          handleLogout();
        } else if (err.response.status === 500) {
          setError(err.response.data.error);
        }
      }
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      fetchCurrentUser();
    }
  }, [authToken, fetchCurrentUser]);

  if (!authToken) {
    return (
      <Router>
        <div className="App">
          <Header />
          <Sidebar isAdmin={isAdmin} isLoggedIn={!!authToken} handleLogout={handleLogout} />
          {error && <div className="error-message">{error}</div>}
          {
              showNotification && (
                  <div className="notification-popup">
                       <p>{t('Notification.message')}</p>
                      <button onClick={handleNotificationClose}>OK</button>
                  </div>
              )
          }
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/submit-game" element={<SubmitGame />} />
            <Route path="/dice" element={<DiceRoller />} />
            <Route path="/login" element={<Login setAuthToken={setAuthToken} setIsAdmin={setIsAdmin} handleLogin={handleLogin} />} />
            <Route path="/register" element={<Register setAuthToken={setAuthToken} setIsAdmin={setIsAdmin} handleLogin={handleLogin} />} />
          </Routes>
        </div>
      </Router>
    );
  } else {
    return (
      <Router>
        <div className="App">
          <Header />
          <Sidebar isAdmin={isAdmin} isLoggedIn={!!authToken} handleLogout={handleLogout} />
          {error && <div className="error-message">{error}</div>}
          {
              showNotification && (
                  <div className="notification-popup">
                      <p>{t('Notification.message')}</p>
                      <button onClick={handleNotificationClose}>OK</button>
                  </div>
              )
          }
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/:id" element={<GameDetails />} />
            {isAdmin && (
              <Route path="/admin" element={<AdminDashboard />}>
                <Route path="general" element={<AdminGeneral authToken={authToken} currentUserId={currentUserId} />} />
                <Route path="categories" element={<ManageCategories authToken={authToken} />} />
                <Route path="games" element={<ManageGames authToken={authToken} />} />
                <Route path="submitted-games" element={<ManageUserSubmittedGames authToken={authToken} />} />
                <Route path="submitted-games/:id" element={<SubmittedGameDetail authToken={authToken} />} />
              </Route>
            )}
            <Route path="/submit-game" element={<SubmitGame authToken={authToken} />} />
            <Route path="/dice" element={<DiceRoller />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
