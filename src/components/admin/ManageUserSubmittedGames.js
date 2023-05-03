import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const ManageUserSubmittedGames = () => {
  const [userSubmittedGames, setUserSubmittedGames] = useState([]);

  useEffect(() => {
    fetchUserSubmittedGames();
  }, []);

  const fetchUserSubmittedGames = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/user-submitted-games`);
      setUserSubmittedGames(response.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      {/* Render list of user submitted games for approving and rejecting */}
    </div>
  );
};

export default ManageUserSubmittedGames;
