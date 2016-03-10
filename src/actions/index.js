import logger from '../logger';
const log = logger.getLogger('actions');

//------------------------------------------------------------------------------
// App
//------------------------------------------------------------------------------
export const SAY_HELLO = 'SAY_HELLO';
export const SAY_GOODBYE = 'SAY_GOODBYE';
export const SAYING_HELLO = 'SAYING_HELLO'; // async action

exports.sayHello = () => {
  log.debug('dispatching ' + SAY_HELLO);
  return { type: SAY_HELLO }
};
exports.sayGoodbye = () => {
  log.debug('dispatching ' + SAY_GOODBYE);
  return { type: SAY_GOODBYE }
};
exports.sayingHello = () => {
  log.debug('dispatching ' + SAYING_HELLO);
  return { type: SAYING_HELLO }
};
exports.asyncSayHello = (howLong) => {
  return (dispatch) => {
    log.debug('dispatching asyncSayHello, delay is ' + howLong);
    dispatch(exports.sayingHello());
    setTimeout(() => {
      log.debug('dispatching sayHello')
      dispatch(exports.sayHello());
    }, howLong);
  }
};
