import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  // Route,
  // Link,
} from "react-router-dom";

import Cabecera from './Components/Cabecera';
import InicioSesion from './Components/InicioSesion';
import Registro from './Components/Registro'
import Carta from './Components/Carta';
import Mesas from './Components/Mesas';

import PrivateRoute from './Components/PrivateRoute';

const router = createBrowserRouter([
  {
    element: (
      <>
        <Cabecera /> 
        <Outlet />
      </>
    ),

    children: [
      {
        path: "/",
        element: <App/>,
      },
      {
        path: "login",
        element: <InicioSesion/>,
      },
      {
        path: "registro",
        element: <Registro/>,
      },
      {
        path: "carta",
        element: <Carta/>,
      },
      {
        path: "mesas",
        element: <PrivateRoute Component={Mesas} />,
        
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router}/>
    <Outlet />
  </>,
)

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App/>,
//   },
//   {
//     path: "login",
//     element: <InicioSesion/>,
//   },
//   {
//     path: "carta",
//     element: <Carta/>,
//   },
//   {
//     path: "mesas",
//     element: <PrivateRoute Component={Mesas} />,
    
//   }
// ]);


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <RouterProvider router={router}/>
//   </React.StrictMode>
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
