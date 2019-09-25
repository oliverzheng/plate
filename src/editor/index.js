// @flow
// @format

import React from 'react';
import ReactDOM from 'react-dom';
import nullthrows from 'nullthrows';
import './index.css';
import App from './App';
import type {FileIO} from './App';

export type {FileIO} from './App';

export default function index(rootElementID: string, fileIO: FileIO) {
  ReactDOM.render(
    <App fileIO={fileIO} />,
    nullthrows(document.getElementById(rootElementID)),
  );
}
