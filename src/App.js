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

function App({ router: Router = BrowserRouter}) {
  const initialToken = localStorage.getItem('authToken') || '';
  
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(initialToken);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [katermodus, setKatermodus] = useState(localStorage.getItem('katermodus') === 'true' || false);

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

  useEffect(() => {
    localStorage.setItem('katermodus', katermodus);
    if (katermodus) {
      document.body.classList.add('katermodus');
    } else {
      document.body.classList.remove('katermodus');
    }
  }, [katermodus]);
  

  if (!authToken) {
    return (
      <Router>
        <div className="App">
          <Header />
          <Sidebar isAdmin={isAdmin} isLoggedIn={!!authToken} handleLogout={handleLogout} />
          {error && <div className="error-message">{error}</div>}
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/submit-game" element={<SubmitGame />} />
            <Route path="/dice" element={<DiceRoller />} />
            <Route path="/login" element={<Login setAuthToken={setAuthToken} setIsAdmin={setIsAdmin} handleLogin={handleLogin} />} />
            <Route path="/register" element={<Register setAuthToken={setAuthToken} setIsAdmin={setIsAdmin} handleLogin={handleLogin} />} />
          </Routes>
          <button className={`katermodus-icon ${katermodus ? "active" : ""}`} onClick={() => setKatermodus(prev => !prev)} aria-label="Toggle Katermodus">
              <div className="icon-circle">
                  <i className="fas fa-cat"></i>
              </div>
          </button>
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
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/:id" element={<GameDetails authToken={authToken} />} />
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
          <button className={`katermodus-icon ${katermodus ? "active" : ""}`} onClick={() => setKatermodus(prev => !prev)} aria-label="Toggle Katermodus">
            <div className="icon-circle">
                <i className="fas fa-cat"></i>
            </div>
        </button>
        </div>
      </Router>
    );
  }
}

export default App;
