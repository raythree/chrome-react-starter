import { combineReducers } from 'redux';
import * as actions from '../actions';

//------------------------------------------------------------------------------
// app reducer
//------------------------------------------------------------------------------
function app(state = { message: '' }, action) {
  switch (action.type) {
    case actions.SAY_HELLO:
      return { message: 'Hello!!!' };
    case actions.SAY_GOODBYE:
      return { message: 'GoodBye!!!' };
    case actions.SAYING_HELLO:
      return { message: 'Please wait...' };
    default:
      return state;
  }
}

export default combineReducers({
  app,
  // add other reducers here
});
