// @flow
// @format

/* eslint global-require: off */

import {format as formatUrl} from 'url';
import path from 'path';
import nullthrows from 'nullthrows';
import {app, BrowserWindow} from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow = null;

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload)),
    // eslint-disable-next-line no-console
  ).catch(console.log);
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDevelopment) {
    mainWindow.loadURL(
      `http://localhost:${nullthrows(process.env.ELECTRON_WEBPACK_WDS_PORT)}`,
    );
  } else {
    mainWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }),
    );
  }

  if (process.env.START_MINIMIZED) {
    mainWindow.minimize();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
