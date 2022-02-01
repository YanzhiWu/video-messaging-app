import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FormLabel, FormButton } from './SharedStyles';

const Card = styled.div`
  padding: 1rem;
  border: #ccc 2px dotted;
  margin: 10px;
`;

const PendingView = ({ history, socket, currentUser }) => {
  const [timer, setTimer] = useState(10);
  const url = window.location.href.split('/');
  const urlLen = window.location.href.split('/').length;
  const caller = url[urlLen - 2];
  const id = url[urlLen - 3];

  useEffect(() => {
    setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);
  }, [currentUser]);

  useEffect(() => {
    if (timer <= 0) {
      if (socket) {
        socket.emit('norespond-call', {
          chatroomId: id,
          caller,
        });
      }
      history.push(`/chatroom/${id}/${currentUser}/${caller}`);
    }
    setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);
  }, [timer]);

  const onAccept = async (ev) => {
    ev.preventDefault();
    if (socket) {
      socket.emit('accept-call', {
        chatroomId: id,
        caller,
      });
    }
    history.push(`/calling/${id}/${caller}/${currentUser}`);
  };

  const onDecline = async (ev) => {
    ev.preventDefault();
    if (socket) {
      socket.emit('decline-call', {
        chatroomId: id,
        caller,
      });
    }
    history.push(`/chatroom/${id}/${currentUser}/${caller}`);
  };

  return (
    <div style={{ gridArea: 'ft', margin: '50px' }}>
      <Card key={caller} style={{ textAlign: 'center' }}>
        <h4> {caller} is video calling you.</h4>
        <FormLabel
          style={{
            marginBottom: '30px',
            color: 'black',
            cursor: 'pointer',
          }}
        >
          {timer}
        </FormLabel>{' '}
        <FormButton
          type='submit'
          value='accepted'
          onClick={onAccept}
          style={{
            marginBottom: '20px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Accept
        </FormButton>{' '}
        <FormButton
          type='submit'
          value='declined'
          onClick={onDecline}
          style={{
            marginBottom: '20px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Decline
        </FormButton>{' '}
      </Card>
    </div>
  );
};

PendingView.propTypes = {
  history: PropTypes.object.isRequired,
  socket: PropTypes.object,
  currentUser: PropTypes.string.isRequired,
};

export default PendingView;
