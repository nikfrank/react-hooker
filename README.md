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