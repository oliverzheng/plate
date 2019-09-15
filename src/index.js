// @flow
// @format

import React from 'react';
import ReactDOM from 'react-dom';
import nullthrows from 'nullthrows';
import './index.css';
import App from './editor/App';

ReactDOM.render(<App />, nullthrows(document.getElementById('root')));
