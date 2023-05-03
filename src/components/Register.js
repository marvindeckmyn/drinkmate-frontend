import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Register = ({ setAuthToken, handleLogin }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const passwordsMatch = () => {
    return formData.password === formData.confirmPassword;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/users/register`, formData);
      if (response.data.token) {
        setAuthToken(response.data.token);
        handleLogin(response.data.userId, response.data.isAdmin);
      } else {
        console.error('Registration error: Token not received.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main">
      <div className="register">
        <h1>{t('Register.title')}</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder={t('Register.usernamePlaceholder')} onChange={handleChange} value={formData.username} required />
          <input type="email" name="email" placeholder={t('Register.emailPlaceholder')} onChange={handleChange} value={formData.email} required />
          <input type="password" name="password" placeholder={t('Register.passwordPlaceholder')} onChange={handleChange} value={formData.password} required />
          <input type="password" name="confirmPassword" placeholder={t('Register.confirmPasswordPlaceholder')} onChange={handleChange} value={formData.confirmPassword} required />
          <button type="submit" disabled={!passwordsMatch()}>{t('Register.registerButton')}</button>
        </form>
        <p>
          {t('Register.alreadyHaveAccount')}{' '}
          <Link to="/login">{t('Register.loginLink')}</Link>
        </p>
      </div>
    </div>
    
  );
};

export default Register;