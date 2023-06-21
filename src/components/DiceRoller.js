import React, { useState } from 'react';
import dice1 from '../assets/images/dice1.svg';
import dice2 from '../assets/images/dice2.svg';
import dice3 from '../assets/images/dice3.svg';
import dice4 from '../assets/images/dice4.svg';
import dice5 from '../assets/images/dice5.svg';
import dice6 from '../assets/images/dice6.svg';
import { useTranslation } from 'react-i18next';

const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6];

const DiceRoller = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState([0]);
  const { t } = useTranslation();
  const [result, setResult] = useState(null);

  const handleRoll = () => {
    let newValues = [];
    let total = 0;
    for (let i = 0; i < diceCount; i++) {
      let roll = Math.floor(Math.random() * 6) + 1;
      total += roll;
      newValues.push(roll - 1);
    }
    setDiceValues(newValues);
    setResult(total);
  };

  const chooseDice = (count) => {
    setDiceCount(count);
    setDiceValues(Array(count).fill(0));
    setResult(null);
  };

  return (
    <div className="main">
      <div className="diceroller">
        <h1>{t('DiceRoller.title')}</h1>
        <h2>{t('DiceRoller.description')}</h2>
        <div className="dice-buttons">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <button key={number} onClick={() => chooseDice(number)}>{number}</button>
          ))}
        </div>
        <div className="dice-display">
          {diceValues.map((value, index) => (
            <img key={index} src={diceImages[value]} alt={`Dice showing ${value + 1}`} />
          ))}
        </div>
        <button onClick={handleRoll}>{t('DiceRoller.roll')}</button>
        {result !== null && <p>{t('DiceRoller.youRolled')} {result}</p>}
      </div>
    </div>
  );
}

export default DiceRoller;