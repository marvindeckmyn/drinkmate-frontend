import React, { useState } from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const DeleteCategoryModal = ({ category, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  Modal.setAppElement('#root');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = async () => {
    try {
      await onDelete(category.id);
      toggleModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button onClick={toggleModal}>
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Delete Category Modal">
        <h2>{t('DeleteCategoryModal.deleteCategoryTitle')}</h2>
        <p>{t('DeleteCategoryModal.deleteCategoryWarning')}</p>
        <button onClick={handleDelete}>{t('DeleteCategoryModal.deleteCategoryButton')}</button>
        <button onClick={toggleModal}>{t('DeleteCategoryModal.cancelButton')}</button>
      </Modal>
    </>
  );
};

export default DeleteCategoryModal;