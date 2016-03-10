import thunkMiddleware from 'redux-thunk';
import reducers from '../src/reducers';
import * as actions from '../src/actions';
import { createStore, applyMiddleware } from 'redux';
import logger from '../src/logger';

const log = logger.getLogger('testReducers');
logger.configure({level: 'DEBUG'});

describe('reducer tests', function () {
  let store, state;

  beforeEach(() => {
    store = createStore(reducers, applyMiddleware(thunkMiddleware));
  });

  it('should have the right default state', function () {
    state = store.getState();
    assert(state.app.message === '');
  });

  it('should say hello', function () {
    store.dispatch(actions.sayHello());
    state = store.getState();
    assert(state.app.message === 'Hello!!!');
  });

  it('should say goodbype', function () {
    store.dispatch(actions.sayGoodbye());
    state = store.getState();
    assert(state.app.message === 'GoodBye!!!');
  });

  it('should say hello asynchronously', function (done) {
    store.dispatch(actions.asyncSayHello(100));
    setTimeout(() => {
      state = store.getState();
      log.info('MESSAGE: ' + state.app.message);
      assert(state.app.message === 'Please wait...');
      setTimeout(() => {
        state = store.getState();
        log.info('MESSAGE: ' + state.app.message);
        assert(state.app.message === 'Hello!!!');
        done();
      }, 200);
    }, 10);
  });

});
