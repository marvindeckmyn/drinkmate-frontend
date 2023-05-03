import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faUser, faPlus, faSignOutAlt, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const MobileNavbar = ({ isAdmin, isLoggedIn, handleLogout }) => {

  return (
    <nav className="mobile-navbar">
      <ul>
        <li>
          <NavLink to="/games" activeClassName="active">
            <FontAwesomeIcon icon={faGamepad} />
          </NavLink>
        </li>
        {isAdmin && (
          <li>
            <NavLink to="/admin/general" activeClassName="active">
              <FontAwesomeIcon icon={faUser} />
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/submit-game" activeClassName="active">
            <FontAwesomeIcon icon={faPlus} />
          </NavLink>
        </li>
        {isLoggedIn ? (
          <li>
            <button onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </li>
        ) : (
          <li>
            <NavLink to="/login" activeClassName="active">
              <FontAwesomeIcon icon={faSignInAlt} />
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MobileNavbar;