import React, { Component } from 'react';

const mapValues = (obj={}, vMap)=> Object
  .keys(obj)
  .reduce( (p, c)=> ({...p, [c]: vMap(obj[c]) }), {});

export default P => class HookedP extends Component {
  state = { }

  hooks = mapValues( P.hooks, hook=> (...hookArgs) => ( new Promise( (resolve, reject)=>{
    const hookRes = hook(...hookArgs);

    ( hookRes instanceof Promise ) ? (
      hookRes.then( resolved => this.setState( resolved, resolve ) )
             .catch( err => reject(err) )
      
    ) : this.setState( hookRes, resolve );
  }) ) )
  
  render(){
    return (
      <P {...this.hooks} {...this.props} {...this.state}/>
    );
  }
}
