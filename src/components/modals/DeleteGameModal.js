import React, { useState } from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';

const DeleteGameModal = ({ game, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  Modal.setAppElement('#root');

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = async () => {
    try {
      await onDelete(game.id);
      toggleModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button onClick={toggleModal}>{t('ManageGames.delete')}</button>
      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Delete Game Modal">
        <h2>{t('DeleteGameModal.deleteGameTitle')}</h2>
        <p>{t('DeleteGameModal.deleteGameWarning')}</p>
        <button onClick={handleDelete}>{t('DeleteGameModal.deleteGameButton')}</button>
        <button onClick={toggleModal}>{t('DeleteGameModal.cancelButton')}</button>
      </Modal>
    </>
  );
};

export default DeleteGameModal;