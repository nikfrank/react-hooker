# react-hooker

this is a simple HOC for organizing network behaviour

```js
import React, { Component } from 'react';
import hooker from 'react-hooker';

class App extends Component {
  static hooks = {
    loadItems: ()=> fetch('/items')
                       .then( response => response.json() )
                       .then( items => ({ items }) ),

    loadFakeItems: ()=> Promise.resolve({
      items: [
        { id: 0, displayName: 'cat', price: 3.5 },
        { id: 1, displayName: 'phone', price: 35 },
      ]
    }),

    loadSyncItems: ()=> ({
      items: [
        { id: 0, displayName: 'cat', price: 3.5 },
        { id: 1, displayName: 'phone', price: 35 },
      ]
    })
  }

  componentDidMount(){
    // use this when there is network connectivity
    this.props.loadItems();

    // use this one when in offline mode!
    // this.props.loadFakeItems();

    // or
    // this.props.loadSyncItems();
  }

  render(){
    const { items=[] } = this.props;

    return (
      <ul>
        {items.map( item => (
          <li key={item.id}>
            {item.displayName} = ${item.price}
          </li>
        ) )}
      </ul>
    );
  }
}

export default hooker(App);
```


## for observables / sockets / triggering updates from a / calling a hook multiple times

```js
class ticker {
  constructor( next, done, err ){
    this.next = next, this.done = done, this.err = err;
    this.count = 0;
  }

  cleanup(){
    clearInterval(this.interval);
  }

  handleRequest(...args){
    if(this.interval) clearInterval(this.interval);

    if( !args[0] ) this.done();
    else if( args[0] < 0 ) this.err('negative tick length not allowed');
    else this.interval = setInterval(()=> this.next({ count: this.count++ }), args[0]);
  }
}

export { ticker }; // from ./network, into the static hooks eventually
```

this example will make an interval of whatever length you tell it when calling the hook, to update props.count

```js
this.props.ticker(1000);
```

calling it again will clear the old interval so you can change the tick length

```js
this.props.ticker(2000);
```

without restarting the count

cleanup will be called when the component dismounts (componentWillUnmount)

or when calling the handler with 0

```js
this.props.ticker(0);
```

by triggering the done callback

...

errors end up on `this.props[hookName+'HookErr']`

```js
this.props.ticker(-1);

//...

render(){
  console.log(this.props.tickerHookErr); // 'negative tick length not allowed'
  return (<JSX/>);
}
```

you can also return a promise from handleRequest that will be the result of calling the hook each time, resolved after the setState is done (and so your props will be updated)