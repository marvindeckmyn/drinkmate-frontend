import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        toast.success(t('Login.loginSuccessful'));
        navigate('/');
      } else {
        toast.error('Login.loginFailure')
      }
    } catch (err) {
      console.error(err);
      toast.error(t('Login.credentialsAreNotCorrect'))
    }
  };

  return (
    <div className="main">
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} />
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