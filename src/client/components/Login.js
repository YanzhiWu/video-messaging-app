import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import {
  ErrorMessage,
  FormBase,
  FormLabel,
  FormInput,
  FormButton,
} from './SharedStyles';

const ResetLink = () => (
  <Link to='/resetPassword' style={{ textDecoration: 'none' }}>
    <h4 style={{ textAlign: 'justify', marginLeft: '110px' }}>
      <FontAwesomeIcon icon={faKey} /> Forgot password? Click here to reset!
    </h4>
  </Link>
);

const Login = (props) => {
  const [username, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/session', {
      body: JSON.stringify({
        username,
        password,
      }),
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
    });
    const data = await res.json();
    if (res.ok) {
      props.logIn(data.username);
    } else {
      setError(`${data.error}`);
    }
  };

  useEffect(() => {
    document.getElementById('username').focus();
  }, []);

  return (
    <div style={{ gridArea: 'main' }}>
      <ErrorMessage msg={error} />
      <FormBase>
        <FormLabel htmlFor='username'>Username:</FormLabel>
        <FormInput
          id='username'
          name='username'
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUser(e.target.value.toLowerCase())}
        />
        <FormLabel htmlFor='password'>Password:</FormLabel>
        <FormInput
          id='password'
          name='password'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div />
        <FormButton
          id='submitBtn'
          onClick={onSubmit}
          style={{ color: 'white' }}
        >
          Login
        </FormButton>
      </FormBase>
      <ResetLink />
    </div>
  );
};

Login.propTypes = {
  logIn: PropTypes.func.isRequired,
};

export default Login;
