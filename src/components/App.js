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

    const buttonsDisabled = this.props.app.busy ? ' disabled' : '';
    const busyIndicator = this.props.app.busy ? <span className="glyphicon glyphicon-refresh glyphicon-spin" /> : '';

    const comp =
      <div>
        <div className="row">
          <div className="col-md-12">
            <img src="icon-64.png" style={{float:'left'}} />
            <h4 style={{float: 'left'}}>Starter Chrome React App</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div style={{display: 'inline-block', margin: '10px'}}>
              <button className="btn btn-default" onClick={this.props.sayHello} disabled={buttonsDisabled}>
                Say Hello
              </button>
            </div>
            <div style={{display: 'inline-block', margin: '10px'}}>
              <button className="btn btn-default" onClick={this.props.sayGoodBye} disabled={buttonsDisabled}>
                Say Goodbye
              </button>
            </div>
            <div style={{display: 'inline-block', margin: '10px'}}>
              <button disabled={ buttonsDisabled } className={'btn btn-default'} onClick={this.props.asyncSayHello}>
                  Say Hello Asynch
              </button> {busyIndicator}
            </div>
          </div>
        </div>

        <div className="panel panel-default" style={{padding: '2em'}}>
          {this.props.app.message}
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
    sayGoodBye: () => { dispatch(actions.sayGoodbye()); },
    asyncSayHello: () => { dispatch(actions.asyncSayHello(2000)); }
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
