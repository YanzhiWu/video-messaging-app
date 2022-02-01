import React, { useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { options, rtc } from './constants';

import { FormButton } from './SharedStyles';

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const Half = styled.div`
  float: left;
  width: 50%;
  height: 100vh;
  border: 1px dotted black;
  box-sizing: border-box;
`;

const Card = styled.div`
  padding: 0.01rem;
  border: 1px dotted black;
  margin: 0.5px;
`;

const CallingView = ({ history, currentUser }) => {
  const url = window.location.href.split('/');
  const urlLen = window.location.href.split('/').length;
  const id = url[urlLen - 3];
  const caller = url[urlLen - 2];
  const receiver = url[urlLen - 1];
  const contact = currentUser === receiver ? caller : receiver;

  const joinStream = async () => {
    try {
      rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
      await rtc.client.join(options.appId, id, options.token, null);
      rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      rtc.localVideoTrack.play('local-stream');
      rtc.client.on('user-published', async (user, mediaType) => {
        await rtc.client.subscribe(user, mediaType);
        if (mediaType === 'video' || mediaType === 'all') {
          const remoteVideoTrack = user.videoTrack;
          const PlayerContainer = React.createElement('div', {
            id: user.uid,
            className: 'stream',
          });
          ReactDOM.render(
            PlayerContainer,
            document.getElementById('remote-stream'),
          );
          user.videoTrack.play(`${user.uid}`);
        }
        if (mediaType === 'audio' || mediaType === 'all') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack.play();
        }
      });
      rtc.client.on('user-unpublished', (user) => {
        const playerContainer = document.getElementById(user.uid);
        if (playerContainer) {
          playerContainer.remove();
        }
      });
      await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    } catch (error) {
      console.error(error);
    }
  };

  const cleanup = async () => {
    const localContainer = document.getElementById('local-stream');
    rtc.localAudioTrack.close();
    rtc.localVideoTrack.close();
    if (localContainer) {
      localContainer.textContent = '';
    }
    await rtc.client.leave();
  };

  const leaveCall = () => {
    history.push(`/chatroom/${id}/${currentUser}/${contact}`);
  };

  useEffect(() => {
    joinStream();
    return async () => {
      cleanup();
    };
  }, [currentUser]);

  const onLeave = (ev) => {
    ev.preventDefault();
    leaveCall();
  };

  return (
    <div style={{ height: '100vh', gridArea: 'ft', margin: '50px' }}>
      <Container>
        <Half>
          <Card key={currentUser} style={{ textAlign: 'center' }}>
            <h4> {currentUser} </h4>
            <FormButton
              type='submit'
              value='leave'
              onClick={onLeave}
              style={{
                marginBottom: '10px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Leave
            </FormButton>{' '}
          </Card>
          <div
            id='local-stream'
            className='stream local-stream'
            style={{ height: '85.8vh' }}
          />
        </Half>
        <Half>
          <Card
            key={contact}
            style={{ paddingBottom: '2.33rem', textAlign: 'center' }}
          >
            <h4> {contact} </h4>
          </Card>
          <div
            id='remote-stream'
            className='stream remote-stream'
            style={{ height: '85.8vh' }}
          />
        </Half>
      </Container>
    </div>
  );
};

CallingView.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.string.isRequired,
};

export default CallingView;
