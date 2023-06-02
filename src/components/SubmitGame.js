import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { setCache, getCache } from '../apiCache';

const SubmitGame = ({ authToken }) => {
  const isLoggedIn = !!localStorage.getItem('authToken');
  const [categories, setCategories] = useState([]);
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );
  const [newGame, setNewGame] = useState({
    name: '',
    player_count: '',
    description: '',
    alias: '',
    necessities: '',
    category_id: '',
  });
  const { t, i18n } = useTranslation();

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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all(fetchCategories());
    };
    fetchData();
  }, [fetchCategories]);

  const handleEditorStateChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const description = JSON.stringify(rawContent);
  
    setNewGame({
      ...newGame,
      description: description,
    });
    setEditorState(newEditorState);
  };

  const handleChange = (e) => {
    setNewGame({ ...newGame, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_BASE_URL}/api/submitted/games`, newGame, {
        headers: {
          'x-auth-token': authToken,
          'Content-Type': 'multipart/form-data',
        },
      });
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
          <input type="text" name="name" placeholder="Game Name" onChange={handleChange} value={newGame.name} required />
          <input type="text" name="alias" placeholder="Alias" onChange={handleChange} value={newGame.alias} />
          <select
            value={newGame.category_id}
            onChange={(e) =>
              setNewGame({ ...newGame, category_id: parseInt(e.target.value) })
            }
          >
            {categories.map((category) => {
              const translation = category.translations.find(
                (t) => t.code === i18n.language
              );
              return (
                <option key={category.id} value={category.id}>
                  {translation ? translation.name : category.name}
                </option>
              );
            })}
          </select>
          <input type="number" name="player_count" placeholder="Player Count" onChange={handleChange} value={newGame.player_count} required />
          <input type="text" name="necessities" placeholder="Necessities" onChange={handleChange} value={newGame.necessities} />
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorStateChange}
            toolbar={{
              options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
            }}
            placeholder="Description"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitGame;