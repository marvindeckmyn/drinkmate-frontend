import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from '../../config';
import parse from 'html-react-parser';
import { useTranslation } from 'react-i18next';

const SubmittedGameDetail = ({ authToken }) => {
  const { id } = useParams();
  const [gameDetail, setGameDetail] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/submitted/games/${id}`, {
          headers: { 'x-auth-token': authToken},
        });
        setGameDetail(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGameDetails();
  }, [id, authToken]);

  const approveGame = async () => {
    try {
      await axios.put(`${config.API_BASE_URL}/api/submitted/games/${id}/approve`, {}, {
        headers: { 'x-auth-token': authToken },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const rejectGame = async () => {
    try {
      await axios.delete(`${config.API_BASE_URL}/api/submitted/games/${id}/reject`, {
        headers: { 'x-auth-token': authToken },
      });
    } catch (err) {
      console.error(err);
    }
  }

  if (!gameDetail) {
    return <div>Penis...</div>;
  }

  return (
    <div>
      <h1>{gameDetail.name}</h1>
      {gameDetail.alias && (
        <p>{gameDetail.alias}</p>
      )}
      
      <h2>{t('SubmittedGame.description')}</h2>
      <p>{parse(gameDetail.description)}</p>

      <h2>{t('SubmittedGame.necessities')}</h2>
      <p>{gameDetail.necessities}</p>

      <h2>{t('SubmittedGame.details')}</h2>
      <p>
        {t('SubmittedGame.minimumPlayers')}: {gameDetail.player_count}
      </p>
      <p>
        {t('SubmittedGame.category')}: {gameDetail.category}
      </p>
      <p>
        {t('SubmittedGame.creator')}: {gameDetail.creator}
      </p>
      
      <button onClick={approveGame}>{t('SubmittedGame.approve')}</button>
      <button onClick={rejectGame}>{t('SubmittedGame.reject')}</button>
    </div>
  );
};

export default SubmittedGameDetail;