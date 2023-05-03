import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import config from '../../config';
import { useTranslation } from 'react-i18next';

const CreateCategoryModal = ({ onCategoryCreated, authToken, languages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ translations: [] });
  const { t } = useTranslation();
  const customStyles = {
    content: {
      width: '80%',
      maxWidth: '500px',
      height: 'auto',
      margin: 'auto',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  };
  

  Modal.setAppElement('#root');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCreateCategory = async () => {
    try {
      await axios.post(`${config.API_BASE_URL}/api/categories`, newCategory, {
        headers: {
          'x-auth-token': authToken,
        },
      });
      onCategoryCreated();
      toggleModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button onClick={toggleModal}>{t('CreateCategoryModal.createCategoryButton')}</button>
      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={toggleModal} 
        contentLabel="Create Category Modal"
        style={customStyles}
      >
        <div className="create-category-modal">
          <h2>{t('CreateCategoryModal.createCategoryTitle')}</h2>
          {languages.map(({ code, name, id }) => (
            <div key={code}>
              <label>{name}:</label>
              <input
                type="text"
                onChange={(e) => {
                  const updatedTranslations = newCategory.translations.filter(
                    (translation) => translation.language_id !== id
                  );
                  setNewCategory({
                    ...newCategory,
                    translations: [
                      ...updatedTranslations,
                      { language_id: id, name: e.target.value },
                    ],
                  });
                }}
              />
            </div>
          ))}
          <button onClick={handleCreateCategory}>{t('CreateCategoryModal.createCategoryButton')}</button>
          <button onClick={toggleModal}>{t('CreateCategoryModal.cancelButton')}</button>
        </div>
      </Modal>
    </>
  );
};

export default CreateCategoryModal;
