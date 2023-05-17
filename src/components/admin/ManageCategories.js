import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../../config';
import CreateCategoryModal from '../modals/CreateCategoryModal';
import EditCategoryModal from '../modals/EditCategoryModal';
import DeleteCategoryModal from '../modals/DeleteCategoryModal';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageCategories = ({ authToken }) => {
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const onLanguageChanged = (lng) => setCurrentLanguage(lng);
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [i18n]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/api/categories`, {
        headers: { 'x-auth-token': authToken },
      });
      const translatedCategories = data.map((category) => {
        const translation = category.translations.find(
          (translation) => translation.code === i18n.language
        );
        return { ...category, name: translation ? translation.name : category.name };
      });
      setCategories(translatedCategories);
    } catch (err) {
      console.error(err);
    }
  }, [authToken, i18n.language]);

  const fetchLanguages = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/api/languages`, {
        headers: { 'x-auth-token': authToken },
      });
      setLanguages(data);
    } catch (err) {
      console.error(err);
    }
  }, [authToken]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    fetchCategories();
  }, [currentLanguage, fetchCategories]);

  const handleCategoryCreated = () => {
    fetchCategories();
    toast.success('Category created successfully!');
  };

  const handleUpdateCategory = async (category) => {
    try {
      await axios.put(`${config.API_BASE_URL}/api/categories/${category.id}`, category, {
        headers: { 'x-auth-token': authToken },
      });
      fetchCategories();
      toast.success('Category updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update the category!');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${config.API_BASE_URL}/api/categories/${categoryId}`, {
        headers: { 'x-auth-token': authToken },
      });
      fetchCategories();
      toast.success('Category deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete the category!');
    }
  };

  return (
    <div className="manage-categories">
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} />
      <h1>{t('ManageCategories.manageCategoriesTitle')}</h1>
      <div className="create-category-wrapper">
        <CreateCategoryModal
          onCategoryCreated={handleCategoryCreated}
          authToken={authToken}
          languages={languages}
        />
      </div>

      <h2>{t('ManageCategories.categories')}</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <div className="edit-delete-buttons">
              <EditCategoryModal
                category={category}
                onUpdate={handleUpdateCategory}
                authToken={authToken}
                languages={languages}
              />
              <DeleteCategoryModal category={category} onDelete={handleDeleteCategory} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageCategories;