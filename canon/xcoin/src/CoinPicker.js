import React from 'react';
import './CoinPicker.css';

export default ({ fromCoin, toCoin, setFrom, setTo })=> (
  <div className='CoinPicker'>
    <label>
      From
      <select value={fromCoin} onChange={setFrom}>
        <option value=''>Select From Coin</option>
        <option value='USD'>USD</option>
        <option value='EUR'>EUR</option>
        <option value='BTC'>BTC</option>
        <option value='ETH'>ETH</option>
        <option value='WINGS'>WINGS</option>
      </select>
    </label>

    <label>
      To
      <select value={toCoin} onChange={setTo}>
        <option value=''>Select To Coin</option>
        <option value='USD'>USD</option>
        <option value='EUR'>EUR</option>
        <option value='BTC'>BTC</option>
        <option value='ETH'>ETH</option>
        <option value='WINGS'>WINGS</option>
      </select>
    </label>
  </div>
);
