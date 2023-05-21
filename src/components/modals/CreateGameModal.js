import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import config from '../../config';
import { useTranslation } from 'react-i18next';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const CreateGameModal = ({ onGameCreated, authToken, languages, categories }) => {
  if (!categories || categories.length === 0) {
    throw new Error('Categories array is empty or not provided');
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [necessityInputs, setNecessityInputs] = useState([0]);
  const [newGame, setNewGame] = useState({
    translations: [],
    aliases: [],
    descriptions: [],
    necessities: [],
    player_count: 0,
    image: '',
    category_id: categories[0].id,
    publish: true,
    new: true,
  });
  const { t } = useTranslation();

  Modal.setAppElement('#root');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const resetInputFields = () => {
    setEditorState(EditorState.createEmpty());
    setUploadedImage(null);
    setImagePreviewUrl('');
    setNecessityInputs([0]);
    setNewGame({
      translations: [],
      aliases: [],
      descriptions: [],
      necessities: [],
      player_count: 0,
      image: '',
      category_id: categories[0].id,
    });
  };

  const handleEditorStateChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const description = JSON.stringify(rawContent);
  
    const updatedDescriptions = newGame.descriptions.filter(
      (description) => description.language_id !== selectedLanguage.id
    );
    setNewGame({
      ...newGame,
      descriptions: [
        ...updatedDescriptions,
        { language_id: selectedLanguage.id, description },
      ],
    });
    setEditorState(newEditorState);
  };

  const createEditorStateFromDescription = (description) => {
    const content = description ? JSON.parse(description) : null;
    const contentState = content ? convertFromRaw(content) : null;
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

    const updatedNecessities = newGame.necessities.filter(
      (necessity) => necessity.inputIndex !== indexToRemove
    );
    setNewGame({ ...newGame, necessities: updatedNecessities });
  }

  function restructureNecessitiesData(necessities) {
    const necessitiesByInputIndex = {};

    for (const necessity of necessities) {
      if (!necessitiesByInputIndex[necessity.inputIndex]) {
        necessitiesByInputIndex[necessity.inputIndex] =  {
          translations: []
        };
      }

      necessitiesByInputIndex[necessity.inputIndex].translations.push({
        language_id: necessity.language_id,
        name: necessity.name
      });
    }

    return Object.values(necessitiesByInputIndex);
  }

  const handleCreateGame = async () => {
    try {
      const gameToSave = { ...newGame };

      // Restructure necessities data
      gameToSave.necessities = restructureNecessitiesData(newGame.necessities);

      // Convert descriptions to HTML
      gameToSave.descriptions = gameToSave.descriptions.map((descriptionObj) => {
        const rawContent = JSON.parse(descriptionObj.description);
        const contentState = convertFromRaw(rawContent);
        const htmlDescription = stateToHTML(contentState);
        return { ...descriptionObj, description: htmlDescription };
      });

      // FormData object to send the image file
      const formData = new FormData();
      formData.append('image', uploadedImage);

      const jsonData = { ...gameToSave };
      delete jsonData.image;
      formData.append('data', JSON.stringify(jsonData));

      await axios.post(`${config.API_BASE_URL}/api/games`, formData, {
        headers: {
          'x-auth-token': authToken,
          'Content-Type': 'multipart/form-data',
        },
      });
      onGameCreated();
      toggleModal();
      resetInputFields();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button onClick={toggleModal}>{t('CreateGameModal.createGameButton')}</button>
      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Create Game Modal">
      <label>{t('CreateGameModal.language')}</label>
      <select
        value={selectedLanguage.id}
        onChange={(e) => {
          const language = languages.find((lang) => lang.id === parseInt(e.target.value));
          setSelectedLanguage(language);

          const descriptionObj = newGame.descriptions.find(
            (description) => description.language_id === language.id
          );

          const newEditorState = createEditorStateFromDescription(
            descriptionObj ? descriptionObj.description : null
          );
          setEditorState(newEditorState);
        }}
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
              newGame.translations.find(
                (translation) => translation.language_id === selectedLanguage.id
              )?.name || ''
            }
            onChange={(e) => {
              const updatedTranslations = newGame.translations.filter(
                (translation) => translation.language_id !== selectedLanguage.id
              );
              setNewGame({
                ...newGame,
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
              newGame.aliases.find(
                (alias) => alias.language_id === selectedLanguage.id
              )?.alias || ''
            }
            onChange={(e) => {
              const updatedAliases = newGame.aliases.filter(
                (alias) => alias.language_id !== selectedLanguage.id
              );
              setNewGame({
                ...newGame,
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
            value={newGame.category_id}
            onChange={(e) =>
              setNewGame({ ...newGame, category_id: parseInt(e.target.value) })
            }
          >
            {categories.map((category) => {
              const translation = category.translations.find(
                (t) => t.language_id === selectedLanguage.id
              );
              return (
                <option key={category.id} value={category.id}>
                  {translation ? translation.name : category.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label>{t('CreateGameModal.playerCount')}</label>
          <input
            type="number"
            value={newGame.player_count}
            onChange={(e) =>
              setNewGame({ ...newGame, player_count: parseInt(e.target.value) })}
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
                value={
                  newGame.necessities.find(
                    (necessity) =>
                      necessity.language_id === selectedLanguage.id &&
                      necessity.inputIndex === inputIndex
                  )?.name || ''
                }
                onChange={(e) => {
                  const updatedNecessities = newGame.necessities.filter(
                    (necessity) =>
                      necessity.language_id !== selectedLanguage.id ||
                      necessity.inputIndex !== inputIndex
                  );
                  setNewGame({
                    ...newGame,
                    necessities: [
                      ...updatedNecessities,
                      {
                        language_id: selectedLanguage.id,
                        name: e.target.value,
                        inputIndex,
                      },
                    ],
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
        {/* Publish */}
        <div>
          <label>{t('CreateGameModal.publish')}</label>
          <input
            type="checkbox"
            checked={newGame.publish}
            onChange={(e) =>
              setNewGame({ ...newGame, publish: e.target.checked })
            }
          />
        </div>
        {/* New */}
        <div>
          <label>{t('CreateGameModal.new')}</label>
          <input
            type="checkbox"
            checked={newGame.new}
            onChange={(e) =>
              setNewGame({ ...newGame, new: e.target.checked })
            }
          />
        </div>
        <button onClick={handleCreateGame}>{t('CreateGameModal.createGameButton')}</button>
        <button onClick={toggleModal}>{t('CreateGameModal.cancelButton')}</button>
      </Modal>
    </>
  );
};

export default CreateGameModal;