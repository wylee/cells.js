import React from 'react';
import ReactDOM from 'react-dom';
import AppWithContext from './App';
import * as serviceWorker from './serviceWorker';
import './index.css';

ReactDOM.render(<AppWithContext />, document.getElementById('root'));

serviceWorker.unregister();
