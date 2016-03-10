import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import logger from '../logger';

const log = logger.getLogger('App');

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    $("[rel='tooltip']").tooltip(); // this enables bootstrap tooltips
    const comp =
      <div>
        <div className="row">
          <div className="col-md-12">
            <img src="icon-64.png" style={{float:'left'}} />
            <h4 style={{float: 'left'}}>Starter Chrome React App</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <button className="btn btn-default">Say Hello</button>
          </div>
          <div className="col-md-4">
            <button className="btn btn-default">Say Goodbye</button>
          </div>
          <div className="col-md-4">
            <button className="btn btn-default">Say Hello Async</button>
          </div>
        </div>

      </div>

    return comp;
  }
}

function mapStateToProps(state) {
  return ({
    app: state.app
  });
}
function mapDispatchToProps(dispatch) {
  return ({
    sayHello: () => { dispatch(actions.sayHello()); },
    sayGoodBye: () => { dispatch(actions.sayGoodBye()); },
    asyncSayHello: () => { dispatch(actions.asyncSayHello()); }
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
