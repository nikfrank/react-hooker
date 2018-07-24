import React, { Component } from 'react';
import './App.css';

import hooker from '../../../';

import CoinPicker from './CoinPicker';
import RatesChart from './RatesChart';

class App extends Component {
  state = {
    fromCoin: '',
    toCoin: '',
  }

  static hooks = {
    loadExchange: (fromCoin, toCoin)=>
      fetch(`https://min-api.cryptocompare.com/data/histoday?`+
            `fsym=${fromCoin}&tsym=${toCoin}&limit=60&aggregate=3&e=CCCAGG`)
      .then( response => response.json() )
      .then( responseJson => ({ historicalRates: responseJson.Data }) ),
  }
  
  componentDidUpdate(prevProps, prevState){
    if( this.state.toCoin && this.state.fromCoin &&
        ( (this.state.fromCoin !== prevState.fromCoin ) ||
          (this.state.toCoin !== prevState.toCoin ) ) ) {

      this.props.loadExchange(this.state.fromCoin, this.state.toCoin);
    }
  }
  
  setFrom = event=> this.setState({ fromCoin: event.target.value })
  setTo = event=> this.setState({ toCoin: event.target.value })
  
  render() {
    return (
      <div className="App">
        <CoinPicker fromCoin={this.state.fromCoin}
                    toCoin={this.state.toCoin}
                    setFrom={this.setFrom}
                    setTo={this.setTo}/>

        <RatesChart rates={this.props.historicalRates}/>
      </div>
    );
  }
}

export default hooker( App );
