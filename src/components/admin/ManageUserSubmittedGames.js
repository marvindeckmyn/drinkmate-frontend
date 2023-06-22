import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useTranslation } from 'react-i18next';

const ManageUserSubmittedGames = ({ authToken }) => {
  const [userSubmittedGames, setUserSubmittedGames] = useState([]);
  const { t } = useTranslation();

  const fetchUserSubmittedGames = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/submitted/games`, {
        headers: { 'x-auth-token': authToken },
      });
      setUserSubmittedGames(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [authToken]);

  useEffect(() => {
    fetchUserSubmittedGames();
  }, [fetchUserSubmittedGames]);

  return (
    <div>
      <h1>{t('ManageUserSubmittedGames.title')}</h1>
      <h2>{t('ManageUserSubmittedGames.submittedGamesTitle')}</h2>
      <ul>
        {userSubmittedGames.map((game) => (
          <li key={game.id}>
            <Link to={`/admin/submitted-games/${game.id}`}>{game.name} by {game.creator}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUserSubmittedGames;
