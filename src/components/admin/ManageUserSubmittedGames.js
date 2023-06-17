import React, { useState, useEffect, useCallback } from 'react';
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

  const approveGame = async (game) => {
    try {
      await axios.post(`${config.API_BASE_URL}/api/user-submitted-games/${game.id}/approve`, game);
      fetchUserSubmittedGames();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectGame = async (gameId) => {
    try {
      await axios.delete(`${config.API_BASE_URL}/api/user-submitted-games/${gameId}/reject`);
      fetchUserSubmittedGames();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Manage User Submitted Games</h1>
      <h2>Submitted Games</h2>
      <ul>
        {userSubmittedGames.map((game) => (
          <li key={game.id}>
            {game.name} by {game.creator}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUserSubmittedGames;
