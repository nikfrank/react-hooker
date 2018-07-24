import React, { Component } from 'react';

import connectHooks from './connectHooks';

import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const syncSpy = jest.fn().mockReturnValue([1, 2, 3]);
const syncSpyUpdate = jest.fn().mockReturnValue(4);

const apiSpy = jest.fn().mockReturnValue(['a', 'b', 'c']);
const apiSpyUpdate = jest.fn().mockReturnValue('d');

class Tester extends Component {
  static hooks = {
    sync: ()=> ({ items: syncSpy() }),
    api: ()=> Promise.resolve({ things: apiSpy() }),
    syncUpdater: ()=> cache => ({ items: cache.items.concat(syncSpyUpdate()) }),
    apiUpdater: ()=> Promise.resolve( cache => ({
      things: cache.things.concat(apiSpyUpdate()),
    }) ),
  }

  render(){
    const {
      sync, api, syncUpdater, apiUpdater,
      items=[], things=[],
    } = this.props;
    
    return (
      <div>
        <button onClick={sync} className='sync'>Sync</button>
        <button onClick={api} className='api'>Api</button>
        <button onClick={syncUpdater} className='syncUpdater'>Sync Updater</button>
        <button onClick={apiUpdater} className='apiUpdater'>Api Updater</button>
        <div className='items'>{JSON.stringify(items)}</div>
        <div className='things'>{JSON.stringify(things)}</div>
      </div>
    );
  }
}


it('connects the hooks', (done) => {
  // mount a test component
  const P = connectHooks(Tester);  
  const p = mount(<P/>);
  
  // simulate a click to a button
  expect( p.find('.items').first().text() ).toEqual( '[]' );
  expect( p.find('.things').first().text() ).toEqual( '[]' );

  // simulate button clicks, expect data to update

  // sync
  expect( syncSpy.mock.calls ).toHaveLength( 0 );
  p.find('button.sync').first().simulate('click');

  expect( syncSpy.mock.calls ).toHaveLength( 1 );
  expect( p.find('.items').first().text() ).toEqual( '[1,2,3]' );

  
  // async "api"
  expect( apiSpy.mock.calls ).toHaveLength( 0 );
  p.find('button.api').first().simulate('click');

  expect( apiSpy.mock.calls ).toHaveLength( 1 );

  // timeout because async
  setTimeout(()=>{
    expect( p.find('.things').first().text() ).toEqual( '["a","b","c"]' );
    
    // sync updater
    expect( syncSpyUpdate.mock.calls ).toHaveLength( 0 );
    p.find('button.syncUpdater').first().simulate('click');

    expect( syncSpyUpdate.mock.calls ).toHaveLength( 1 );
    expect( p.find('.items').first().text() ).toEqual( '[1,2,3,4]' );


    // async updater
    expect( apiSpyUpdate.mock.calls ).toHaveLength( 0 );
    p.find('button.apiUpdater').first().simulate('click');

    // setState with an updater is async if called outside of component stack
    setTimeout(()=>{
      expect( apiSpyUpdate.mock.calls ).toHaveLength( 1 );

      setTimeout(()=>{
        expect( p.find('.things').first().text() ).toEqual( '["a","b","c","d"]' );
        done();
      }, 0);
    }, 0);
  }, 0);
});

// needs a test that makes sure the return value from the hook is a promise that resolves after the hook update is done
