import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import io from 'socket.io-client';

import Header from './components/Header';
import Landing from './components/Landing';
import Login from './components/Login';
import Logout from './components/Logout';
import MainView from './components/MainView';
import MsgView from './components/MsgView';
import PendingView from './components/PendingView';
import CallingView from './components/CallingView';
import StatusView from './components/StatusView';
import Profile from './components/Profile';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';
import Deactivate from './components/Deactivate';

const GridBase = styled.div`
  display: grid;
  grid-template-rows: auto auto auto;
  grid-template-columns: 1fr;
  grid-template-areas:
    'hd'
    'main'
    'ft';
  @media (min-width: 500px) {
    grid-template-rows: auto auto auto;
    grid-template-columns: 40px 50px 1fr 50px 40px;
    grid-template-areas:
      'hd hd hd hd hd'
      'sb sb main main main'
      'ft ft ft ft ft';
  }
`;

const defaultUser = {
  username: '',
  email: '',
};

const MyApp = () => {
  const data = localStorage.getItem('user');
  const [state, setState] = useState(data ? JSON.parse(data) : defaultUser);
  const [socket, setSocket] = useState(null);

  const port = process.env.PORT ? process.env.PORT : 'http://localhost:8080';

  const setupSocket = () => {
    if (!socket) {
      const newSocket = io(port);
      setSocket(newSocket);
    }
  };

  useEffect(() => {
    setupSocket();
  }, []);

  const logOut = () => {
    localStorage.removeItem('user');
    setState(defaultUser);
  };

  const logIn = async (username) => {
    try {
      const response = await fetch(`/user/${username}`);
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      setState(user);
    } catch (err) {
      alert('An unexpected error occurred.');
      logOut();
    }
  };

  const loggedIn = () => state.username && state.email;

  return (
    <BrowserRouter>
      <GridBase>
        <Header user={state.username} />
        <Route exact path='/' component={Landing} />
        <Route
          path='/login'
          render={(props) =>
            loggedIn() ? (
              <Redirect to={`/home/${state.username}`} />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/logout'
          render={(props) => <Logout {...props} logOut={logOut} />}
        />
        <Route
          path='/register'
          render={(props) =>
            loggedIn() ? (
              <Redirect to={`/home/${state.username}`} />
            ) : (
              <Register {...props} />
            )
          }
        />
        <Route
          path='/home/:username'
          render={(props) =>
            loggedIn() ? (
              <MainView
                {...props}
                currentUser={state.username}
                image={state.image}
                socket={socket}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/chatroom/:id/:username/:contactname'
          render={(props) =>
            loggedIn() ? (
              <MsgView
                {...props}
                currentUser={state.username}
                image={state.image}
                socket={socket}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/pending/:id/:caller/:receiver'
          render={(props) =>
            loggedIn() ? (
              <PendingView
                {...props}
                currentUser={state.username}
                socket={socket}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/calling/:id/:caller/:receiver'
          render={(props) =>
            loggedIn() ? (
              <CallingView
                {...props}
                currentUser={state.username}
                socket={socket}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/status/:username'
          render={(props) =>
            loggedIn() ? (
              <StatusView
                {...props}
                currentUser={state.username}
                image={state.image}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/profile/:username'
          render={(props) =>
            loggedIn() ? (
              <Profile {...props} currentUser={state.username} />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/changePassword/:username'
          render={(props) =>
            loggedIn() ? (
              <ChangePassword
                {...props}
                currentUser={state.username}
                currentEmail={state.email}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/deactivate/:username'
          render={(props) =>
            loggedIn() ? (
              <Deactivate
                {...props}
                currentUser={state.username}
                currentEmail={state.email}
              />
            ) : (
              <Login {...props} logIn={logIn} />
            )
          }
        />
        <Route
          path='/resetPassword'
          render={(props) => <ResetPassword {...props} />}
        />
      </GridBase>
    </BrowserRouter>
  );
};

render(<MyApp />, document.getElementById('mainDiv'));
