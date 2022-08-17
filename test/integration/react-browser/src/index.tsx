import React from 'react';
import {render} from 'react-dom';
import App from './App';
import AppAuto from './AppAuto';

render(
  <React.StrictMode>
    <App />
    <AppAuto />
  </React.StrictMode>,
  document.getElementById('root')
);
