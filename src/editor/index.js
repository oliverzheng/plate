// @flow
// @format

import React from 'react';
import ReactDOM from 'react-dom';
import nullthrows from 'nullthrows';
import './index.css';
import App from './App';

export default function index(rootElementID: string) {
  ReactDOM.render(<App />, nullthrows(document.getElementById(rootElementID)));
}
