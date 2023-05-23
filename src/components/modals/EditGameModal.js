import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import config from '../../config';
import { useTranslation } from 'react-i18next';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const EditGameModal = ({ game, onUpdate, authToken, languages, categories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [necessityInputs, setNecessityInputs] = useState([0]);
  const [necessityInputValues, setNecessityInputValues] = useState({});
  const [editedNecessities, setEditedNecessities] = useState({});
  const [updatedGame, setUpdatedGame] = useState(game);
  const { t } = useTranslation();

  useEffect(() => {
    if (languages && languages.length > 0 && languages.every(lang => lang !== null)) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages]);

  useEffect(() => {
    setUpdatedGame((prevUpdatedGame) => {
      const updatedGame = { ...prevUpdatedGame, ...game };

    const getNecessitiesToDisplay = () => {
      if (!updatedGame.necessities) return [];

      const existingNecessities = updatedGame.necessities.filter(
        (necessity) => necessity.language_id === selectedLanguage?.id
      );

      const editedNecessitiesForLanguage = editedNecessities[selectedLanguage.id];

      return editedNecessitiesForLanguage
        ? editedNecessitiesForLanguage
        : existingNecessities;
    };

    const updateNecessityInputs = (necessitiesToDisplay) => {
      if (necessitiesToDisplay.length > 0) {
        setNecessityInputs(necessitiesToDisplay.map((_, index) => index));
      } else {
        setNecessityInputs([0]);
      }
    };

    const updateNecessityInputValues = (necessitiesToDisplay) => {
      setNecessityInputValues((prevValues) => {
        const updatedValues = { ...prevValues };
        if (!updatedValues[selectedLanguage.id]) {
          updatedValues[selectedLanguage.id] = necessitiesToDisplay.map((necessity) => {
            if (!necessity) return '';
            if (selectedLanguage.id === 1) {
              return necessity.necessity_name;
            } else {
              return necessity.necessity_translation_name;
            }
          });
        }
        return updatedValues;
      });
    };

    const necessitiesToDisplay = getNecessitiesToDisplay();
    updateNecessityInputs(necessitiesToDisplay);
    updateNecessityInputValues(necessitiesToDisplay);
  
      if (game.image) {
        setImagePreviewUrl(`${config.API_BASE_URL}/games/${game.image}`);
      }
  
      const descriptionObj = game.descriptions?.find(
        (description) => description.language_id === selectedLanguage.id
      );
  
      const newEditorState = createEditorStateFromDescription(
        descriptionObj ? descriptionObj.description : null
      );
      setEditorState(newEditorState);
  
      return updatedGame;
    });
  }, [editedNecessities, game, selectedLanguage?.id]);  
  
  useEffect(() => {
      if (game) {
        setUpdatedGame(game);
      }
    }, [game]);

  Modal.setAppElement('#root');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleLanguageChange = (e) => {
    const newLanguageId = parseInt(e.target.value);
    const newLanguage = languages?.find((lang) => lang.id === newLanguageId);
  
    setEditedNecessities((prevEditedNecessities) => {
      const updatedEditedNecessities = { ...prevEditedNecessities };
      updatedEditedNecessities[selectedLanguage?.id] = necessityInputValues[selectedLanguage?.id];
      return updatedEditedNecessities;
    });
  
    setSelectedLanguage(newLanguage);
  
    const descriptionObj = updatedGame.descriptions?.find(
      (description) => description.language_id === newLanguageId
    );
  
    const newEditorState = createEditorStateFromDescription(
      descriptionObj ? descriptionObj.description : null
    );
    setEditorState(newEditorState);
  };
  

  const handleEditorStateChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const description = JSON.stringify(rawContent);
  
    const updatedDescriptions = updatedGame.descriptions.filter(
      (description) => description.language_id !== selectedLanguage.id
    );
    setUpdatedGame({
      ...updatedGame,
      descriptions: [
        ...updatedDescriptions,
        { language_id: selectedLanguage.id, description },
      ],
    });
    setEditorState(newEditorState);
  };

  const createEditorStateFromDescription = (description) => {
    const contentState = description ? stateFromHTML(description) : null;
    return contentState ? EditorState.createWithContent(contentState) : EditorState.createEmpty();
  };

  const handleImageChange = (e) => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      setUploadedImage(file);
      setImagePreviewUrl(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const addNecessityInput = () => {
    setNecessityInputs([...necessityInputs, necessityInputs.length]);
  };

  const removeNecessityInput = (indexToRemove) => {
    setNecessityInputs(necessityInputs.filter((_, index) => index !== indexToRemove));

    const updatedNecessities = updatedGame.necessities.filter(
      (necessity) => necessity.inputIndex !== indexToRemove
    );
    setUpdatedGame({ ...updatedGame, necessities: updatedNecessities });
  }

  const handleUpdateGame = async () => {
    try {
      const gameToSave = { ...updatedGame };

      // Create a new array for necessities
      gameToSave.necessities = necessityInputs.flatMap((inputIndex) => {
        return Object.entries(necessityInputValues).flatMap(([languageId, values]) => {
          const value = values[inputIndex];
          if (!value) return [];
      
          const originalNecessity = game.necessities.find(
            (necessity) => necessity.language_id === parseInt(languageId, 10) && necessity.necessity_name === value
          );

          return {
            ...originalNecessity,
            game_id: gameToSave.id,
            language_id: parseInt(languageId, 10),
            name: value,
          };
        });
      });
      
      // Convert descriptions to HTML
      gameToSave.descriptions = gameToSave.descriptions.map((descriptionObj) => {
        let htmlDescription;
        try {
          const rawContent = JSON.parse(descriptionObj.description);
          const contentState = convertFromRaw(rawContent);
          htmlDescription = stateToHTML(contentState);
        } catch (err) {
          htmlDescription = descriptionObj.description;
        }
        return { ...descriptionObj, description: htmlDescription };
      });

      // FormData object to send the image file
      const formData = new FormData();

      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      
      formData.append('game_data', JSON.stringify(gameToSave)); 

      await axios.put(`${config.API_BASE_URL}/api/games/${game.id}`, formData, {
        headers: {
          'x-auth-token': authToken,
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpdate();
      toggleModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button onClick={toggleModal}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Edit Game Modal">
      <label>{t('CreateGameModal.language')}</label>
      <select
        value={selectedLanguage && selectedLanguage.id}
        onChange={handleLanguageChange}
      >
        {languages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name}
          </option>
        ))}
      </select>
      {/* Game Title */}
      <div>
          <label>{t('CreateGameModal.gameTitle')}</label>
          <input
            type="text"
            value={
              updatedGame.translations?.find(
                (translation) => translation.language_id === selectedLanguage.id
              )?.name || ''
            }
            onChange={(e) => {
              const updatedTranslations = updatedGame.translations?.filter(
                (translation) => translation.language_id !== selectedLanguage.id
              );
              setUpdatedGame({
                ...updatedGame,
                translations: [
                  ...updatedTranslations,
                  { language_id: selectedLanguage.id, name: e.target.value },
                ],
              });
            }}
          />
        </div>
        {/* Alias */}
        <div>
          <label>{t('CreateGameModal.alias')}</label>
          <input
            type="text"
            value={
              updatedGame.aliases.find(
                (alias) => alias.language_id === selectedLanguage.id
              )?.alias || ''
            }
            onChange={(e) => {
              const updatedAliases = updatedGame.aliases.filter(
                (alias) => alias.language_id !== selectedLanguage.id
              );
              setUpdatedGame({
                ...updatedGame,
                aliases: [
                  ...updatedAliases,
                  { language_id: selectedLanguage.id, alias: e.target.value },
                ],
              });
            }}
          />
        </div>
        <div>
          <label>{t('CreateGameModal.category')}</label>
          <select
            value={updatedGame.category_id}
            onChange={(e) =>
              setUpdatedGame({ ...updatedGame, category_id: parseInt(e.target.value) })
            }
          >
            {categories.map((category) => {
              // Find the translation for the category name in the selected language
              const categoryNameTranslation = category.translations.find(
                (translation) => translation.language_id === selectedLanguage.id
              )?.name;

              return (
                <option key={category.id} value={category.id}>
                  {categoryNameTranslation || category.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label>{t('CreateGameModal.playerCount')}</label>
          <input
            type="number"
            value={updatedGame.player_count}
            onChange={(e) =>
              setUpdatedGame({ ...updatedGame, player_count: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label>{t('CreateGameModal.image')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreviewUrl && (
            <div>
              <img src={imagePreviewUrl} alt="Uploaded game" style={{ width: '359.99px', height: '202.49px' }} />
            </div>
          )}
        </div>
        {/* Necessities */}
        <div>
          <label>{t('CreateGameModal.necessities')}</label>
          {necessityInputs.map((inputIndex) => (
            <div key={inputIndex}>
              <input
                type="text"
                value={necessityInputValues[selectedLanguage.id]?.[inputIndex] || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setNecessityInputValues((prevValues) => {
                    const updatedValues = { ...prevValues };
                    if (!updatedValues[selectedLanguage.id]) {
                      updatedValues[selectedLanguage.id] = [];
                    }
                    updatedValues[selectedLanguage.id][inputIndex] = newValue;
                    return updatedValues;
                  });
                }}
                
              />
              <button onClick={() => removeNecessityInput(inputIndex)}>
                {t('CreateGameModal.removeNecessityButton')}
              </button>
            </div>
          ))}
          <button onClick={addNecessityInput}>{t('CreateGameModal.addNecessityButton')}</button>
        </div>
        {/* Description */}
        <div>
          <label>{t('CreateGameModal.description')}</label>
          <Editor
            editorState={editorState}
            onEditorStateChange={handleEditorStateChange}
            toolbar={{
              options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
              // Customize the toolbar options as needed
            }}
          />
        </div>
        <button onClick={handleUpdateGame}>{t('EditGameModal.updateGameButton')}</button>
        <button onClick={toggleModal}>{t('EditGameModal.cancelButton')}</button>
</Modal>
</>
);
};

export default EditGameModal;
