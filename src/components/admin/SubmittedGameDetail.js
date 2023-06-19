import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from '../../config';
import parse from 'html-react-parser';

const SubmittedGameDetail = ({ authToken }) => {
  const { id } = useParams();
  const [gameDetail, setGameDetail] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/submitted/games/${id}`, {
          headers: { 'x-auth-token': authToken},
        });
        setGameDetail(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGameDetails();
  }, [id, authToken]);

  if (!gameDetail) {
    return <div>Penis...</div>;
  }

  return (
    <div>
      <h1>{gameDetail.name}</h1>
      {gameDetail.alias && (
        <p>{gameDetail.alias}</p>
      )}
      
      <h2>Description</h2>
      <p>{parse(gameDetail.description)}</p>

      <h2>Necessities</h2>
      <p>{gameDetail.necessities}</p>

      <h2>Details</h2>
      <p>
        Minimum players: {gameDetail.player_count}
      </p>
      <p>
        Category: {gameDetail.category}
      </p>
      <p>
        Creator: {gameDetail.creator}
      </p>
    </div>
  );
};

export default SubmittedGameDetail;