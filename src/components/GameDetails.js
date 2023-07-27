import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import { Helmet } from 'react-helmet';

const GameDetails = () => {
  const [game, setGame] = useState(null);
  const { id } = useParams();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const updateClickCount = async () => {
      try {
        await axios.put(`${config.API_BASE_URL}/api/games/${id}/click`);
      } catch (err) {
        console.error("Error updating click count: ", err);
      }
    }

    const fetchGame = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/games/${id}`);
        setGame(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const sendDiscordNotification = async () => {
      try {
        // Get the user's location
        const geoResponse = await axios.get('https://api.ipgeolocation.io/ipgeo?apiKey=1c9c9eb3cd264563b16f8d3fdc441567');
        const { city, country_name } = geoResponse.data;
    
        // Create the message
        const content = `Someone from ${city}, ${country_name} is watching ${game.name}`;
    
        // Send to Discord via Webhook
        await axios.post('https://discord.com/api/webhooks/1134221696488984688/cTOMLi6fSyzw7mgXiCXpeicRjyLdHWU_51ohnL8dR5XNmIFKq7lDlbQp12I6kDdPTmx8', { content });
      } catch (error) {
        console.error('Error sending Discord notification:', error);
      }
    };
    

    fetchGame();
    updateClickCount();
    sendDiscordNotification();
  }, [game.name, id]);

  const getTranslatedName = (translations, defaultValue) => {
    if (translations && translations.length > 0) {
      const languageCode = i18n.language;
      const translation = translations.find((t) => t.code === languageCode);
      return translation ? translation.name : defaultValue;
    }
    return defaultValue;
  };

  if (!game) {
    return <div>{t('GameDetails.loading')}...</div>;
  }

  const getTranslatedAlias = (aliases, defaultValue) => {
    if (aliases && aliases.length > 0) {
      const languageCode = i18n.language;
      const alias = aliases.find((a) => a.code === languageCode);
      return alias ? alias.alias : defaultValue;
    }
    return defaultValue;
  }

  const getTranslatedDescription = (descriptions, defaultValue) => {
    if (descriptions && descriptions.length > 0) {
      const languageCode = i18n.language;
      const description = descriptions.find((d) => d.code === languageCode);
      return description ? description.description : defaultValue;
    }
    return defaultValue;
  };

  const getTranslatedNecessityName = (necessity) => {
    const languageCode = i18n.language;
    const translation = necessity.necessity_translation.find(
      (t) => t.code === languageCode
    );
    return translation ? translation.name : null;
  };

  return (
    <><Helmet>
      <title>{getTranslatedName(game.translations, game.name)}</title>
      <meta name="description" content={getTranslatedDescription(game.descriptions, game.description)} />
      <meta property="og:title" content={getTranslatedName(game.translations, game.name)} />
      <meta property="og:description" content={parse(getTranslatedDescription(game.descriptions, game.description))} />
      <meta property="og:image" content={`${config.API_BASE_URL}/${game.image}`} />
      <meta property="og:url" content={window.location.href} />
      <link rel="alternate" hreflang={i18n.language} href={window.location.href} />
      <html lang={i18n.language} />
    </Helmet><div className="main">
        <div className="game-more-details">
          <h1>{getTranslatedName(game.translations, game.name)}</h1>
          <div className="img-wrapper">
            <img
              src={`${config.API_BASE_URL}/${game.image}`}
              alt={game.name} />
          </div>
          {game.alias && (
            <p className="alias">
              {t('GameDetails.alias')}: {getTranslatedAlias(game.aliases, game.alias)}
            </p>
          )}
          <div className="content-container">
            <h2>{t('GameDetails.description')}</h2>
            <p>{parse(getTranslatedDescription(game.descriptions, game.description))}</p>
            {game.necessities && game.necessities.length > 0 && (
              <>
                <h2>{t('GameDetails.necessities')}</h2>
                <ul className="necessities-list">
                  {game.necessities.map((necessity) => {
                    const translatedName = getTranslatedNecessityName(necessity);
                    return translatedName ? <li key={necessity.necessity_id}>{translatedName}</li> : null;
                  })}
                </ul>
              </>
            )}
            <h2>{t('GameDetails.details')}</h2>
            <p>
              {t('GameDetails.minPlayers')}: {game.player_count}
            </p>
            <p>
              {t('GameDetails.category')}: {getTranslatedName(game.categoryTranslations, game.category)}
            </p>
            <p>
              {t('GameDetails.creator')}: {game.creator}
            </p>
          </div>
        </div>
      </div></>
  );
}

export default GameDetails;