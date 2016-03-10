import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from './logger';
import appReducer from './reducers';
import * as actions from './actions';
import App from './components/App';

// required on IE only
require('es6-promise').polyfill();

logger.configure({level: 'debug'});
const log = logger.getLogger('app');

let store = createStore(
  appReducer,
  applyMiddleware(thunkMiddleware) // allows dispatching async actions
);

if (chrome && chrome.instanceID) {
  chrome.instanceID.getID((id) => { log.info('instanceID: ' + id); });
}

const mount = document.getElementById('app-container');
if (mount) {
  render(
     <Provider store={store}>
       <App />
     </Provider>,
     mount
  );
}
