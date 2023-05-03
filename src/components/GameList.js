import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const GameList = () => {
  const [games, setGames] = useState([]);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/games`);
        setGames(response.data);
      } catch(err) {
        console.error(err);
      }
    };

    fetchGames();
  }, [language]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const getTranslatedName = (translations, defaultValue) => {
    if (translations && translations.length > 0) {
      const languageCode = i18n.language;
      const translation = translations.find((t) => t.code === languageCode);
      return translation ? translation.name : defaultValue;
    }
    return defaultValue;
  };

  return (
    <div className="main">
      <div className="game-list">
        <h1>{t('GameList.title')}</h1>
        <ul>
          {games.map(game => (
            <li key={game.id}>
              <Link to={`/games/${game.id}`}>
                <div className="img-wrapper">
                  <img
                    src={`${config.API_BASE_URL}/games/${game.image}`}
                    alt={game.name}
                  />
                </div>
                <div className="game-info">
                  <h2 className="game-title">{getTranslatedName(game.translations, game.name)}</h2>
                  <p className="game-details">
                    {getTranslatedName(game.categoryTranslations, game.category)} • {game.player_count} {t('GameList.minPlayers')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameList;