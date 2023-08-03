import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import { Helmet } from 'react-helmet';

const GameDetails = ({ authToken }) => {
  const [game, setGame] = useState(null);
  const { slug, language_code } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [translatedSlugs, setTranslatedSlugs] = useState({});

  useEffect(() => {
    if (language_code !== i18n.language) {
        const newSlug = translatedSlugs[i18n.language] || slug;
        navigate(`/${i18n.language}/games/${newSlug}`);
    }
}, [i18n.language, language_code, navigate, slug, translatedSlugs]);
  
  // This useEffect fetches game data when the component mounts or the id changes
  useEffect(() => {
    const supportedLanguages = ['en', 'nl', 'de', 'fr', 'it', 'es'];
    if (!language_code || !supportedLanguages.includes(language_code)) {
      navigate(`/en/${slug}`);
      return;
    }

    const fetchGame = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/games/${language_code}/${slug}`, {
          headers: {
            'x-auth-token': authToken,
          },
        });

        setGame(response.data);
        setTranslatedSlugs(response.data.translatedSlugs || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchGame();

    const updateClickCount = async () => {
      try {
        await axios.put(`${config.API_BASE_URL}/api/${language_code}/games/${slug}/click`);
      } catch (err) {
        console.error("Error updating click count: ", err);
      }
    }
    updateClickCount();

  }, [authToken, slug, language_code, navigate]);

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
      <meta property="title" content={getTranslatedName(game.translations, game.name)} />
      <meta property="image" content={`${config.API_BASE_URL}/${game.image}`} />
      <meta property="url" content={window.location.href} />
      {['en', 'nl', 'de', 'fr', 'it', 'es'].map(lang => (
        <link 
          key={lang}
          rel="alternate" 
          hreflang={lang} 
          href={`${window.location.origin}/${lang}/${slug}`} 
        />
      ))}
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