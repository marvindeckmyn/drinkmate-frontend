import React, { useState, useEffect,  useCallback } from 'react';
import axios from 'axios';
import config from '../../config';
import { useTranslation } from 'react-i18next';

const AdminGeneral = ({ authToken, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const { t } = useTranslation();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/users`, {
        headers: {
          'x-auth-token': authToken,
        },
      });
      setUsers(response.data.sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return 0;
        })
      );
    } catch (err) {
      console.error(err);
    }
  }, [authToken, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleAdminPrivilege = async (user) => {
    if (user.id !== currentUserId) {
      try {
        await axios.put(`${config.API_BASE_URL}/api/users/${user.id}/toggle-admin`,
        {},
        {
          headers: {
            'x-auth-token': authToken,
          },
        });
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
      <div className="admin-general">
        <h1>{t('AdminGeneral.title')}</h1>
        <div className="manage-user-admin-privileges">
          <h2>{t('AdminGeneral.manageUserAdminPrivileges')}</h2>
          <ul>
            {users.map((user) => {
              return (
                <li key={user.id}>
                  <div className="user-info">
                    <span className="username-email">
                      {user.username} ({user.email})
                    </span>
                    <span className="admin-status">
                      {user.is_admin ? t('AdminGeneral.admin') : t('AdminGeneral.notAdmin')}
                    </span>
                    <button
                      onClick={() => toggleAdminPrivilege(user)}
                      disabled={user.id === currentUserId}
                    >
                      {user.is_admin ? t('AdminGeneral.revokeAdmin') : t('AdminGeneral.grantAdmin')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
  );
};

export default AdminGeneral;