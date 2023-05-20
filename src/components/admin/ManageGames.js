import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../../config';
import CreateGameModal from '../modals/CreateGameModal';
import EditGameModal from '../modals/EditGameModal';
import DeleteGameModal from '../modals/DeleteGameModal';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setCache, getCache } from '../../apiCache';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faStar, faStarOfLife } from '@fortawesome/free-solid-svg-icons';

const ManageGames = ({ authToken }) => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const getLanguageIdByCode = useCallback(
    (code) => languages.find((lang) => lang.code === code)?.id,
    [languages]
  );

  const fetchGames = useCallback(async () => {
    try {
      const cacheKey = 'games';
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setGames(cachedData);
      } else {
        const { data } = await axios.get(`${config.API_BASE_URL}/api/games/all`, {
          headers: { 'x-auth-token': authToken },
        });
        const currentLanguageId = getLanguageIdByCode(i18n.language);
        const translatedGames = data.map((game) => {
          const translation = game.translations.find(
            (translation) => translation.language_id === currentLanguageId
          );
          return { ...game, name: translation ? translation.name : game.name };
        });
        setGames(translatedGames);
        setCache(cacheKey, translatedGames);
      }
    } catch (err) {
      console.error(err);
    }
  }, [getLanguageIdByCode, i18n.language, authToken]);

  const fetchCategories = useCallback(async () => {
    try {
      const cacheKey = 'categories';
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setCategories(cachedData);
      } else {
        const { data } = await axios.get(`${config.API_BASE_URL}/api/categories`, {
          headers: { 'x-auth-token': authToken },
        });
        setCategories(data);
        setCache(cacheKey, data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [authToken]);

  const fetchLanguages = useCallback(async () => {
    try {
      const cacheKey = 'languages';
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setLanguages(cachedData);
      } else {
        const { data } = await axios.get(`${config.API_BASE_URL}/api/languages`, {
          headers: { 'x-auth-token': authToken },
        });
        setLanguages(data);
        setCache(cacheKey, data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [authToken]);

  useEffect(() => {
    const languageChangeListener = i18n.on('languageChanged', (language) => {
      setCache('games', null);
      fetchGames();
    });

    return () => {
      i18n.off('languageChanged', languageChangeListener);
    };
  }, [i18n, fetchGames]);
  
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchGames(), fetchCategories(), fetchLanguages()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchGames, fetchCategories, fetchLanguages]);

  const handleGameCreated = () => {
    setCache('games', null);
    fetchGames();
    toast.success('Game created successfully!');
  }

  const handleUpdateGame = () => {
    setCache('games', null);
    fetchGames();
    toast.success('Game updated successfully!');
  }

  const handleToggleNew = async (gameId, currentState) => {
    try {
      await axios.put(`${config.API_BASE_URL}/api/games/${gameId}/new`, { newValue: !currentState }, {
        headers: { 'x-auth-token': authToken },
      });
      setGames(games.map(game => game.id === gameId ? { ...game, new: !currentState } : game));
      toast.success('Game new status toggled successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle the game new status!');
    }
  };

  const handleTogglePublish = async (gameId, currentState) => {
    try {
      await axios.put(`${config.API_BASE_URL}/api/games/${gameId}/publish`, { publishValue: !currentState}, {
        headers: { 'x-auth-token': authToken},
      });
      setGames(games.map(game => game.id === gameId ? { ...game, publish: !currentState } : game));
      toast.success('Game publish status toggled successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle the game publish status!');
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await axios.delete(`${config.API_BASE_URL}/api/games/${gameId}`, {
        headers: { 'x-auth-token': authToken },
      });
      setCache('games', null);
      fetchGames();
      toast.success('Game deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete the game!')
    }
  };

  return (
    <div className="manage-games">
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} />
      <h1>{t('ManageGames.title')}</h1>
      {/* Render form for creating a game */}
      <div className="create-game-modal">
        {!loading && languages.length > 0 && (
          <CreateGameModal
          onGameCreated={handleGameCreated}
          authToken={authToken}
          languages={languages}
          categories={categories}
        />
        )}
      </div>
      {/* Render list of games for updating and deleting */}
      <h2>{t('ManageGames.gamesTitle')}</h2>
      <ul>
        {games.map((game) => {
          return (
            <li key={game.id}>
              {game.name}
              <div className="edit-delete-buttons">
                {!loading && (
                  <EditGameModal
                    game={game}
                    onUpdate={handleUpdateGame}
                    authToken={authToken}
                    languages={languages}
                    categories={categories}
                  />
                )}

                <button onClick={() => handleToggleNew(game.id, game.new)}>
                  <FontAwesomeIcon icon={game.new ? faStarOfLife : faStar} />
                </button>
                <button onClick={() => handleTogglePublish(game.id, game.publish)}>
                  <FontAwesomeIcon icon={game.publish ? faEye : faEyeSlash} />
                </button>
                
                {!loading && (
                <DeleteGameModal game={game} onDelete={handleDeleteGame} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ManageGames;