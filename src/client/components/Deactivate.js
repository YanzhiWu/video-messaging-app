import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage, FormButton, Notify } from './SharedStyles';

const Deactivate = ({ history, currentUser, currentEmail }) => {
  const [notify, setNotify] = useState('');
  const [error, setError] = useState('');

  const onReset = async (ev) => {
    ev.preventDefault();
    if (error !== '') return;
    const data = {
      username: currentUser,
      email: currentEmail,
    };
    const res = await fetch(`/deactivate/${currentUser}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (res.ok) {
      setNotify('Account has been successfully deactivated.');
    } else {
      const err = await res.json();
      setError(err.error);
    }
  };

  const onCancel = async (ev) => {
    ev.preventDefault();
    history.goBack();
  };

  const onAcceptReset = () => {
    history.push('/logout');
  };

  return (
    <div style={{ gridArea: 'main' }}>
      {notify !== '' ? (
        <Notify id='notification' msg={notify} onAccept={onAcceptReset} />
      ) : null}
      <ErrorMessage msg={error} />
      <h4 style={{ color: '#dc3545' }}>
        Your account will be deleted permanently.
      </h4>
      <h4 style={{ color: '#dc3545', marginBottom: '30px' }}>
        You won't be able to reactivate your account or retrieve any of the
        information that you've added.
      </h4>
      <div />
      <div>
        <FormButton
          id='submitBtn'
          onClick={onReset}
          style={{ color: 'white', marginRight: '5px' }}
        >
          Confirm Deactivation
        </FormButton>
        <FormButton
          id='cancelBtn'
          onClick={onCancel}
          style={{ color: 'white' }}
        >
          Cancel
        </FormButton>
      </div>
    </div>
  );
};

Deactivate.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.string.isRequired,
  currentEmail: PropTypes.string.isRequired,
};

export default Deactivate;
