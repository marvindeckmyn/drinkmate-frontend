import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from "react-helmet";
import { useScrollPosition } from '../contexts/ScrollPositionProvider';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [minPlayerCount, setMinPlayerCount] = useState('');
  const [maxPlayerCount, setMaxPlayerCount] = useState('');
  const [minAvailablePlayerCount, setMinAvailablePlayerCount] = useState(1);
  const [maxAvailablePlayerCount, setMaxAvailablePlayerCount] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreGames, setHasMoreGames] = useState(true);
  const [scrollPosition, setScrollPosition] = useScrollPosition();
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const LIMIT = 18; // Number of games per page
  const sliderWidth = 100;
  const minLabelPosition = minPlayerCount 
  ? (minPlayerCount - minAvailablePlayerCount) / (maxAvailablePlayerCount - minAvailablePlayerCount) * sliderWidth 
  : 0;
  const maxLabelPosition = maxPlayerCount ? 
  (maxPlayerCount - minAvailablePlayerCount) / (maxAvailablePlayerCount - minAvailablePlayerCount) * sliderWidth :
  sliderWidth;

  const handleSearchInputChange = (event) => {
    setSearch(event.target.value);
    setGames([]); // clear games
    setCurrentPage(1); // reset page number when search changes
};

  const handleCategoryChange = (categoryId, isChecked) => {
    const updatedCategories = new Set(selectedCategories);
    if (isChecked) {
      updatedCategories.add(categoryId);
    } else {
      updatedCategories.delete(categoryId);
    }
    setSelectedCategories(updatedCategories);
  };

  const getTranslatedName = useCallback((translations, defaultValue) => {
    if (translations && translations.length > 0) {
      const languageCode = i18n.language;
      const translation = translations.find((t) => t.code === languageCode);
      return translation ? translation.name : defaultValue;
    }
    return defaultValue;
  }, [i18n.language]);


  const filteredGames = useCallback(() => {
    let filtered = games.filter((game) => {
      const categoryMatches = selectedCategories.size === 0 || selectedCategories.has(game.category_id);
      const playerCountMatches = (!minPlayerCount || game.player_count >= minPlayerCount) && (!maxPlayerCount || game.player_count <= maxPlayerCount);
      return categoryMatches && playerCountMatches;
    });

    filtered.sort((a, b) => b.click_count - a.click_count);

    return filtered;

  }, [games, selectedCategories, minPlayerCount, maxPlayerCount]);

  const fetchGames = useCallback(async (page = 1) => {
    try {
        const response = await axios.get(`${config.API_BASE_URL}/api/games?page=${page}&limit=${LIMIT}&search=${search}`);
        const fetchedGames = response.data.games;
        const minCount = Math.min(...fetchedGames.map((game) => game.player_count));
        const maxCount = Math.max(...fetchedGames.map((game) => game.player_count));

        setHasMoreGames(response.data.hasMoreGames);
        setGames(prevGames => {
            const uniqueGames = [...prevGames, ...fetchedGames].filter(
                (game, index, self) => index === self.findIndex(g => g.id === game.id)
            );
            return uniqueGames;
        });
        setMinAvailablePlayerCount(minCount);
        setMaxAvailablePlayerCount(maxCount);

        if (!hasRestoredPosition && document.documentElement.offsetHeight >= scrollPosition) {
            window.scrollTo(0, scrollPosition);
            setHasRestoredPosition(true);
        } else if (!hasRestoredPosition && hasMoreGames) {
            fetchGames(page + 1);
        }
    } catch (err) {
        console.error(err);
    }
}, [hasMoreGames, scrollPosition, hasRestoredPosition, search]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGames();
    fetchCategories();
  }, [fetchGames, language, scrollPosition]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  function throttle(fn, wait) {
    let lastFn = 0;
    return function (...args) {
      const current = new Date().getTime();
      if (current - lastFn < wait) return;
      lastFn = current;
      return fn(...args);
    };
  }  

  // Existing useEffect for scroll
  useEffect(() => {
    const checkScrollPosition = throttle(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 10 && hasMoreGames && search === ''
      ) {
        setCurrentPage(prevPage => prevPage + 1); // this line updates currentPage
      }
    }, 100);

    window.addEventListener('scroll', checkScrollPosition);

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [hasMoreGames, search]);

  // Modify your useEffect to listen for currentPage changes and fetch accordingly
  useEffect(() => {
    fetchGames(currentPage);
  }, [fetchGames, search, currentPage]);

  return (
    <><Helmet>
      <title>DrinkMate</title>
      <meta name="description" content="Discover and browse a wide variety of drinking games. Find the perfect game for your next party at DrinkMate." />
    </Helmet><div className="main">
        <div className="game-list">
          <h1>{t('GameList.title')}</h1>
          <div className="search-bar-wrapper">
            <input
              type="text"
              className="search-bar"
              placeholder={t('GameList.searchPlaceholder')}
              value={search}
              onChange={handleSearchInputChange} />
            <FontAwesomeIcon className="search-icon" icon={faSearch} />
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
              title={t('GameList.toggleFilters')}
            >
              <FontAwesomeIcon icon={faSlidersH} />
            </button>
          </div>
          {showFilters && (
            <div className="filters">
              <div className="category-filter">
                <h3>{t('GameList.categories')}</h3>
                <div className="category-flexbox">
                  {categories.map((category) => (
                    <label key={category.id}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(category.id)}
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)} />
                      {getTranslatedName(category.translations, category.name)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="player-count-filter">
                <h3>{t('GameList.minCountPlayers')}</h3>
                <div className="player-count-wrapper">
                  <div className="min-player-count" style={{ left: `${minLabelPosition}%` }}>
                    {minPlayerCount || minAvailablePlayerCount}
                  </div>
                  <div className="max-player-count" style={{ left: `${maxLabelPosition}%` }}>
                    {maxPlayerCount || maxAvailablePlayerCount}
                  </div>
                  <div className="player-count-slider">
                    <Slider
                      range
                      min={minAvailablePlayerCount}
                      max={maxAvailablePlayerCount}
                      defaultValue={[minAvailablePlayerCount, maxAvailablePlayerCount]}
                      onChange={(value) => {
                        setMinPlayerCount(value[0]);
                        setMaxPlayerCount(value[1]);
                      }}
                      allowCross={false} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <ul>
            {filteredGames().map((game) => (
              <li key={game.id}>
                <Link 
                    to={`/games/${game.id}`} 
                    onClick={() => setScrollPosition(window.scrollY)}
                >
                  <div className="img-wrapper">
                    <img
                      src={`${config.API_BASE_URL}/${game.image}`}
                      alt={game.name} />
                  </div>
                  <div className="game-info">
                    <h2 className="game-title">
                      {getTranslatedName(game.translations, game.name)}
                      {game.new && <span className="new-indicator">{t('GameList.new')}</span>}
                    </h2>
                    <p className="game-details">
                      {getTranslatedName(game.categoryTranslations, game.category)} • {game.player_count} {t('GameList.minPlayers')}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div></>
  );
};

export default GameList;