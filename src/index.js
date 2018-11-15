import React, { Component } from 'react';

const mapValues = (obj={}, vMap)=> Object
  .keys(obj)
  .reduce( (p, c)=> ({...p, [c]: vMap(obj[c], c) }), {});


// [call next with]/[hook returns] a promise?
//  it resolves then does setState to trigger render
//  : do setState right away to trigger render
const promiseFromHookRes = p=> hookRes =>
  (new Promise((resolve, reject)=>
    ( hookRes instanceof Promise ) ? (
      hookRes.then( resolved => p.setState( resolved, resolve ) )
             .catch( err => reject(err) )
    ) : (
      p.setState( hookRes, resolve )
    ) ));

export default P => class HookedP extends Component {
  state = { }

  handlers = {}

  hooks = mapValues( P.hooks, (hook, hookName)=>
    (typeof (hook.prototype||{}).handleRequest === 'function') ? (
      (...a)=> (
        (this.handlers[hookName] = this.handlers[hookName] || (
          new hook(promiseFromHookRes(this),
                   ()=> ( (this.handlers[hookName].cleanup || (()=>0))(), delete this.handlers[hookName] ),
                   err=> this.setState({ [hookName+'HookErr']: err } ))
        )).handleRequest(...a)
      )
    ) : (
      (...hookArgs) => promiseFromHookRes(this)( hook(...hookArgs) )
    )
  )

  componentWillUnmount(){
    Object.keys(this.handlers).forEach(h => (this.handlers[h].cleanup || (()=>0))() )
  }
  
  render(){
    return (
      <P {...this.hooks} {...this.props} {...this.state}/>
    );
  }
}
