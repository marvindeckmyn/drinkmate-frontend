import React, { useState, useEffect,  useCallback } from 'react';
import axios from 'axios';
import config from '../../config';
import { useTranslation } from 'react-i18next';

const AdminGeneral = ({ authToken, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/users`, {
        headers: {
          'x-auth-token': authToken,
        },
      });
      const sortedUsers = response.data.sort((a, b) => {
        if (a.is_admin && !b.is_admin) return -1;
        if (!a.is_admin && b.is_admin) return 1;
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return b.id - a.id;
      });
      setUsers(sortedUsers);
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const adminUsers = filteredUsers.filter(user => user.is_admin);
  const recentUsers = search ? filteredUsers : filteredUsers.filter(user => !user.is_admin).slice(0, 10);

  return (
    <div className="admin-general">
      <h1>{t('AdminGeneral.title')}</h1>
      <div className="manage-user-admin-privileges">
      <h2>{t('AdminGeneral.manageUserAdminPrivileges')}</h2>
      <input
        type="text"
        placeholder={t('AdminGeneral.searchUsers')}
        value={search}
        onChange={handleSearchChange}
      />
        <h3>{t('AdminGeneral.manageAdmins')}</h3>
        <ul>
          {adminUsers.map((user) => (
            <li key={user.id}>
              {renderUser(user, toggleAdminPrivilege, currentUserId, t)}
            </li>
          ))}
        </ul>
        <br/>
        <h3>{t('AdminGeneral.manageRecentUsers')}</h3>
        <ul>
          {recentUsers.map((user) => (
            <li key={user.id}>
              {renderUser(user, toggleAdminPrivilege, currentUserId, t)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const renderUser = (user, toggleAdminPrivilege, currentUserId, t) => (
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
);

export default AdminGeneral;