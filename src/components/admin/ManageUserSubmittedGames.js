import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const ManageUserSubmittedGames = ({ authToken }) => {
  const [userSubmittedGames, setUserSubmittedGames] = useState([]);

  const fetchUserSubmittedGames = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/submitted/games`, {
        headers: { 'x-auth-token': authToken },
      });
      setUserSubmittedGames(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [authToken]);

  useEffect(() => {
    fetchUserSubmittedGames();
  }, [fetchUserSubmittedGames]);

  return (
    <div>
      <h1>Manage User Submitted Games</h1>
      <h2>Submitted Games</h2>
      <ul>
        {userSubmittedGames.map((game) => (
          <li key={game.id}>
            <Link to={`/admin/submitted-games/${game.id}`}>{game.name} by {game.creator}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUserSubmittedGames;
