import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setAuthToken, handleLogin }) => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/users/login`, formData);
      if (response.data.token) {
        setAuthToken(response.data.token);
        handleLogin(response.data.userId, response.data.isAdmin);
        navigate('/');
      } else {
        console.error('Login error: Token not received.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main">
      <div className="login">
        <h1>{t('Login.title')}</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="identifier" placeholder={t('Login.identifierPlaceholder')} onChange={handleChange} value={formData.identifier} required />
          <input type="password" name="password" placeholder={t('Login.passwordPlaceholder')} onChange={handleChange} value={formData.password} required />
          <button type="submit">{t('Login.loginButton')}</button>
        </form>
        <p>
          {t('Login.dontHaveAccount')}{' '}
          <Link to="/register">{t('Login.registerLink')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;