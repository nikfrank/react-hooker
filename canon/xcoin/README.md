# mini react course

in 4 quick steps, we'll go from nothing to a cryptocurrency converter widget online!

you can see a running example [here](https://nik-xcoin.herokuapp.com)

google ```npm``` and ```create-react-app``` to get the prerequisites


## getting started

```create-react-app xcoin```

```cd xcoin```

```npm start```

you now have the default create-react-app starter running in your browser and can edit the ```src``` files live


## step 1, make a component to pick currencies

```touch src/CoinPicker.js```

open the new file in your text editor

we'll now write the boilerplate React Component


./src/CoinPicker.js
```js
import React from 'react';

export default (props)=> (
  <div>
    Coming soon...
  </div>
);
```

and we will render one into our App

./src/App.js
```js
import React, { Component } from 'react';
import './App.css';

import CoinPicker from './CoinPicker';

class App extends Component {
  render() {
    return (
      <div className="App">
        <CoinPicker/>
      </div>
    );
  }
}

export default App;
```

(at this point we can also delete most of App.css if you want, as we have deleted the elements being styled)


We'll want two dropdown ```<select>``` tags to choose our ```from``` and ```to``` currencies


first, create a state for our App and set two default coins

./src/App.js
```js
//...

class App extends Component {
  state = {
    fromCoin: 'WINGS',
    toCoin: 'USD',
  }
  
  render() {
    return (
      <div className="App">
        <CoinPicker fromCoin={this.state.fromCoin} toCoin={this.state.toCoin}/>
      </div>
    );
  }
}

//...
```

here we're passing the values to our CoinPicker via props, so it can display the current selection

[read more about React Component and Props here](https://reactjs.org/docs/components-and-props.html)


./src/CoinPicker.js
```js
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
```

Here we are using React's controlled input pattern [read more in their docs](https://reactjs.org/docs/forms.html)

We now need to make our onChange handlers (setFrom and setTo) to make our ```<select>```s work


./src/App.js
```js
//...
  setFrom = event=> this.setState({ fromCoin: event.target.value })
  setTo = event=> this.setState({ toCoin: event.target.value })
  
  render() {
    return (
      <div className="App">
        <CoinPicker fromCoin={this.state.fromCoin}
                    toCoin={this.state.toCoin}
                    setFrom={this.setFrom}
                    setTo={this.setTo}/>
      </div>
    );
  }
//...
```

now our ```<select>```s will trigger state updates from CoinPicker into App when on user change events!

[read here about React's this.setState](https://reactjs.org/docs/state-and-lifecycle.html)

We're following React's "lifting state" pattern which helps keep our logic organized... [read more here](https://reactjs.org/docs/lifting-state-up.html)

let's finish up by making a css file for our CoinPicker and adding a bit of style

```touch src/CoinPicker.css```


./src/CoinPicker.js
```js
import React from 'react';
import './CoinPicker.css';

//...
```

./src/CoinPicker.css
```css
.CoinPicker {
  padding: 4px;
}

.CoinPicker label {
  margin: 4px;
}

.CoinPicker select {
  margin-left: 8px;
  min-width: 150px;
}
```

That'll have to do for now. Nothing fancy!


We're done the first step - we can pick our currencies. Next is to gather data from an API





## step 2, gather data from an API

Whenever a user selects a new coin, we want to call an API to get historical conversion rates to display


When we get the data back from the api, we'll save it to our ```state```, so in step 3 we can pass it to a chart!



we'll use React's ```componentDidUpdate``` lifecycle method to trigger the call [read more here](https://reactjs.org/docs/react-component.html#componentdidupdate)


React will call this function whenever our state changes, so we'll want to make sure we can make a new request before bothering to call


./src/App.js
```js
//...
  componentDidUpdate(prevProps, prevState){
    if( this.state.toCoin && this.state.fromCoin &&
        ( (this.state.fromCoin !== prevState.fromCoin ) ||
          (this.state.toCoin !== prevState.toCoin ) ) ) {

      console.log('call api', this.state.fromCoin, this.state.toCoin);
    }
  }
//...
```

if that boolean statement looks weird to you read about [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) and [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)

(we can check the console in our browser now to see when this is triggered)


we'll be using [cryptocompare's histoday api](https://www.cryptocompare.com/api/#-api-data-histoday-) for data

and the browser ```fetch``` for our http call [read about fetch here](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)


```fetch``` uses ```Promise```s, if you want to try them out first [MDN has a playground here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)


Now let's fill in our API call!


```$ yarn add react-hooker```

./src/App.js
```js
import React, { Component } from 'react';
import hooker from 'react-hooker';

//...
  static hooks = {
    loadExchange: (fromCoin, toCoin)=>
      fetch(`https://min-api.cryptocompare.com/data/histoday?`+
            `fsym=${fromCoin}&tsym=${toCoin}`+
            `&limit=60&aggregate=3&e=CCCAGG`)
        .then( response => response.json() )
        .then( responseJson => ({ historicalRates: responseJson.Data}) )
  }

  componentDidUpdate(prevProps, prevState){
    if( this.state.toCoin && this.state.fromCoin &&
        ( (this.state.fromCoin !== prevState.fromCoin ) ||
          (this.state.toCoin !== prevState.toCoin ) ) ) {

          this.props.loadExchange(this.state.fromCoin, this.state.toCoin);
    }
  }
//...

export default hooker( App );
```

To make our request url we're using string template literals [read more here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)


We wait for the response,
 - *then* we parse the response as json
 - *then* we receive the responseJson and resolve exchange rates to hooker
 - react-hooker will pass the exchange values to props.historicalRates

Try running this in the browser (set values for your currencies) and you'll see the responseJson logged to the console

we can see that the conversaion rate we want is in an array called ```.Data``` (not too expressive a name... SAD!)

each item in the array has a ```.time``` (which is in [unix epoch seconds](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)) and a few different rates (I pay attention to ```.open``` for simplicity's sake)



good job! now we're ready for the last step


## step 3, making a chart

React has a wonderful ecosystem, with many packages ready to solve mot of our problems!

Let's add [recharts](https://npmjs.org/package/recharts) to display our exchange rate data we now have.


Recharts has examples available [here](http://recharts.org/en-US/examples)

specifically we'll be working from [this example](https://jsfiddle.net/alidingling/xqjtetw0/)


To add a package to our project, from the command line (in our project root)

```yarn add recharts```


now we'll want to make another Component for our chart rendering logic

```touch src/RatesChart.js```

./src/RatesChart.js
```js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';


export default ({ rates=[] })=> (
  <div>
    Coming soon...
  </div>
);
```

with a placeholder for now.

We'll want to render our placeholder in our App

./src/App.js
```js
//...

import CoinPicker from './CoinPicker';
import RatesChart from './RatesChart';

//...

  render() {
    return (
      <div className="App">
        <CoinPicker fromCoin={this.state.fromCoin}
                    toCoin={this.state.toCoin}
                    setFrom={this.setFrom}
                    setTo={this.setTo}/>
        <RatesChart />
      </div>
    );
  }
//...
```

Now we're ready to pass data to our RatesChart component, so we can use a recharts LineChart there.

In Step 2, we saved our exchange rate data in ```this.props.historicalRates``` once we got it from the API via react-hooker

so let's pass it into our component by a prop called ```rates```

./src/App.js
```js
//...

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

//...
```

and now in RatesChart we'll receive ```rates``` whenever it is updated.

Let's try rendering out a LineChart based on the example

./src/RatesChart.js
```js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default ({ rates=[] })=> (
  <LineChart width={600} height={300} data={rates}
             margin={{top: 5, right: 30, left: 20, bottom: 5}}>
    <XAxis dataKey='time'/>
    <YAxis/>
    <CartesianGrid strokeDasharray='3 3'/>
    <Tooltip/>
    <Legend />
    <Line type='monotone' dataKey='open' stroke='#8884d8' activeDot={{r: 8}}/>
    <Line type='monotone' dataKey='high' stroke='#82ca9d' />
  </LineChart>
);
```

That worked pretty well!

Notice that the LineChart uses our ```rates``` prop as our data source

The ```<XAxis>``` uses ```time``` from our data for our x coordinate

and each ```<Line>``` reads a different dataKey to make a line


The only thing that's weird is that our x-axis is displaying Unix epoch times (which users won't understand... I've tried)

let's look up in the [recharts XAxis component's API](http://recharts.org) to find out how format our tick strings

... click api then XAxis on the menu (sorry, deeplinking doesn't work on the recharts docs site)


...


if you found ```tickFormatter```, that looks good (there isn't much documentation, but we should be able to guess how it works)

let's guess that it gives us our XAxis value (currently an epoch seconds value) and will render whatever we return from the function we make


so using javascript's built in [Date class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) and [Date formatter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)

./src/RatesChart.js
```js
//...
// convert seconds to milliseconds by * 1000
const dayFromEpochSeconds = epochSeconds =>
  (new Date(epochSeconds * 1000)).toLocaleDateString('en-US');


//...
    <XAxis dataKey='time' tickFormatter={dayFromEpochSeconds}/>
//...

```

now our chart is beautiful.


One last thing before we publish to the internet - let's not show an empty chart when we load the page

[Conditional rendering](https://reactjs.org/docs/conditional-rendering.html#inline-if-else-with-conditional-operator) is pretty straightforward in React, so let's give it a try

we'll want to only render the RatesChart once ```this.props.historicalRates``` has values in it


./src/RatesChart.js
```js
//...
export default ({ rates=[] })=> (
  !rates.length ? null : (
    <LineChart width={600} height={300} data={rates}
      //...
    </LineChart>
  )
);
```

very nice!

Now go and be creative! Make a dropdown for selecting the timespan on the chart (currently our API call asks for 60 days of data).. or whatever you want (the Legend still renders the epoch seconds... see if you can figure out how to fix that!)



## step 4, publish to the web

If you've made an account on heroku.com, we can publish a free tier node to server out our app


these instructions are your first foray into DevOps eh


first let's make a ```Procfile``` - this tells heroku to give us a free tier server

```touch Procfile```

./Procfile
```
web: npm run server
```


we'll need a simple static server from npm


```yarn add pushstate-server```



and we'll need add a ```run server``` script in package.json


./package.json
```
{
  "name": "xcoin-mini",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "pushstate-server": "^3.0.1",
    "react": "^16.2.0",
    "react-dom": "^16.2.0",
    "react-scripts": "1.1.1",
    "recharts": "^1.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject",
    "server": "npm run build && pushstate-server ./build"
  }
}
```

now we can commit our code to git, push to github and connect out github to heroku - and heroku will handle the rest!