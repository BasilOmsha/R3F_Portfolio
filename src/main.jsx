import './style.css';
import React from 'react';
import { Leva } from "leva";
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react'
import App from './App.jsx';


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
      <Leva  />
    </React.StrictMode>
);
