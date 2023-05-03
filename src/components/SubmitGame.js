import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SubmitGame = () => {
  const isLoggedIn = !!localStorage.getItem('authToken');
  const [formData, setFormData] = useState({ name: '', rules: '' });
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('authToken'),
        },
      };
      await axios.post(`${config.API_BASE_URL}/api/games`, formData, config);
      alert('Game submitted succesfully');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="main">
        <div className="submit-game">
          <h1>{t('SubmitGame.title')}</h1>
          <p>{t('SubmitGame.login')}</p>
        </div>
      </div>
      
    );
  }

  return (
    <div className="main">
      <div className="submit-game">
        <h1>Submit a Game</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Game Name" onChange={handleChange} value={formData.name} required />
          <textarea name="rules" placeholder="Game Rules" onChange={handleChange} value={formData.rules} required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitGame;