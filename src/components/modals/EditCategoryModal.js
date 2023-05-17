import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const EditCategoryModal = ({ category, onUpdate, languages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedCategory, setUpdatedCategory] = useState(category);
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

  useEffect(() => {
    setUpdatedCategory(category);
  }, [category]);

  Modal.setAppElement('#root');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleUpdate = async () => {
    try {
      await onUpdate(updatedCategory);
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
      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={toggleModal} 
        contentLabel="Edit Category Modal"
        style={customStyles}
      >
        <div className="edit-category-modal">
          <h2>{t('EditCategoryModal.editCategoryTitle')}</h2>
          {languages.map(({ code, name, id }) => {
            const translation = updatedCategory.translations.find(
              (translation) => translation.language_id === id
            );

            return (
              <div key={code}>
                <label>{name}:</label>
                <input
                  type="text"
                  value={translation ? translation.name : ''}
                  onChange={(e) => {
                    const updatedTranslations = updatedCategory.translations.filter(
                      (t) => t.language_id !== id
                    );

                    setUpdatedCategory({
                      ...updatedCategory,
                      translations: [
                        ...updatedTranslations,
                        {
                          ...translation,
                          language_id: id,
                          name: e.target.value,
                        },
                      ],
                    });
                  }}
                />
              </div>
            );
          })}
          <button onClick={handleUpdate}>{t('EditCategoryModal.updateCategoryButton')}</button>
          <button onClick={toggleModal}>{t('EditCategoryModal.cancelButton')}</button>
        </div>
      </Modal>
    </>
  );
};

export default EditCategoryModal;