import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import { useTranslation } from 'react-i18next';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { setCache, getCache } from '../apiCache';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    category_id: 1,
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
    const description = stateToHTML(contentState);
  
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
          'Content-Type': 'application/json',
        },
      });

      toast.success(t('SubmitGame.submitSuccessful'));
    } catch (err) {
      console.error(err);
      toast.error(t('SubmitGame.submitFailure'))
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
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} />
        <h1>{t('SubmitGame.title')}</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder={t('SubmitGame.gameName')} onChange={handleChange} value={newGame.name} required />
          <input type="text" name="alias" placeholder={t('SubmitGame.alias')} onChange={handleChange} value={newGame.alias} />
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
          <input type="number" name="player_count" placeholder={t('SubmitGame.playerCount')} onChange={handleChange} value={newGame.player_count} required />
          <input type="text" name="necessities" placeholder={t('SubmitGame.necessities')} onChange={handleChange} value={newGame.necessities} />
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorStateChange}
            toolbar={{
              options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
            }}
            placeholder={t('SubmitGame.description')}
          />
          <button type="submit">{t('SubmitGame.submitAction')}</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitGame;