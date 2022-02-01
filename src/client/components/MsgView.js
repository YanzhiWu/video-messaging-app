import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import moment from 'moment';
import axios from 'axios';
import { Button, LinearProgress } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faFileUpload,
  faTrash,
  faSpinner,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage, FormButton } from './SharedStyles';

const ChatContainer = styled.div`
  background: #fff;
`;

const ChatHeader = styled.div`
  background: #6495ed;
  color: #fff;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatMain = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  @media (max-width: 700px) {
    display: block;
  }
`;

const ChatSidebar = styled.div`
  background: #e6e9ff;
  color: black;
  padding: 20px 20px 60px;
  overflow-y: scroll;
  @media (max-width: 700px) {
    display: none;
  }
`;

const ChatMessages = styled.div`
  padding: 30px;
  max-height: 500px;
  overflow-y: scroll;
`;

const Message = styled.div`
  padding: 10px;
  margin-bottom: 15px;
  background-color: #e6e9ff;
`;

const Meta = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: darkblue;
  opacity: 0.7;
  margin-bottom: 7px;
`;

const ChatFormContainer = styled.div`
  padding: 30px;
  background-color: darkblue;
`;

const MsgView = ({ history, socket, currentUser, image }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [messageType, setMessageType] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(0);
  const [calling, setCalling] = useState(false);
  const port = process.env.PORT ? process.env.PORT : 'http://localhost:8080';

  const url = window.location.href.split('/');
  const urlLen = window.location.href.split('/').length;
  const id = url[urlLen - 3];
  const contact = url[urlLen - 1];

  const ref = useRef(null);
  useLayoutEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [currentUser, messages]);

  useEffect(() => {
    if (socket) {
      socket.emit('joinRoom', {
        chatroomId: id,
        user: currentUser,
      });
      socket.on('receiver-offline', (caller) => {
        console.log('received receiver-offline');
        setCalling(false);
        if (caller === currentUser) {
          socket.emit('chatMessage', {
            sender: contact,
            receiver: currentUser,
            senderImage: image,
            date: moment().format('MMMM Do YYYY, h:mm:ss a'),
            chatroomId: id,
            message: 'I am offline. Call me later.',
            type: messageType,
          });
        }
      });
      socket.on('incoming-call', ({ chatroomId, caller }) => {
        console.log('received incoming-call');
        if (caller !== currentUser) {
          history.push(`/pending/${chatroomId}/${caller}/${currentUser}`);
        }
      });
      socket.on('call-accepted', ({ chatroomId, caller }) => {
        console.log('received call-accepted');
        setCalling(false);
        if (caller === currentUser) {
          history.push(`/calling/${chatroomId}/${currentUser}/${contact}`);
        }
      });
      socket.on('call-declined', (caller) => {
        console.log('received call-declined');
        setCalling(false);
        if (caller === currentUser) {
          socket.emit('chatMessage', {
            sender: contact,
            receiver: currentUser,
            senderImage: image,
            date: moment().format('MMMM Do YYYY, h:mm:ss a'),
            chatroomId: id,
            message: 'Call declined.',
            type: messageType,
          });
        }
      });
      socket.on('call-noresponse', (caller) => {
        console.log('received call-norespond');
        setCalling(false);
        if (caller === currentUser) {
          socket.emit('chatMessage', {
            sender: contact,
            receiver: currentUser,
            senderImage: image,
            date: moment().format('MMMM Do YYYY, h:mm:ss a'),
            chatroomId: id,
            message: 'Call not responded.',
            type: messageType,
          });
        }
      });
    }
    return () => {
      if (socket) {
        socket.emit('leaveRoom', {
          chatroomId: id,
          user: currentUser,
        });
      }
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/chatroom/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
      });
      const data = await res.json();
      setMessages(data.messages);
    };
    fetchMessages();
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (msg) => {
        setMessages(messages.concat(msg));
      });
      socket.on('changedMessages', (msgs) => {
        setMessages(msgs);
      });
    }
  }, [currentUser, messages]);

  const onChange = async (e) => {
    e.preventDefault();
    if (error !== '') {
      setError('');
    }
    const msg = e.target.value;
    setMessage(msg);
  };

  const deleteConversation = async (e) => {
    e.preventDefault();
    if (error !== '') {
      setError('');
    }
    if (socket) {
      socket.emit('changeRoomMessages', {
        chatroomId: id,
        msgs: [],
      });
    }
  };

  const deleteMessage = async (idx) => {
    if (error !== '') {
      setError('');
    }
    const messagesCpy = [...messages];
    messagesCpy.splice(idx, 1);
    if (socket) {
      socket.emit('changeRoomMessages', {
        chatroomId: id,
        msgs: messagesCpy,
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (error !== '') {
      setError('');
    }
    if (message === '') {
      setError('Please enter something');
      return;
    }
    if (socket) {
      if (
        messageType === 'image/jpeg' ||
        messageType === 'image/png' ||
        messageType === 'audio/mpeg' ||
        messageType === 'video/mp4'
      ) {
        socket.emit('chatMessage', {
          sender: currentUser,
          receiver: contact,
          senderImage: image,
          date: moment().format('MMMM Do YYYY, h:mm:ss a'),
          chatroomId: id,
          message,
          type: messageType,
        });
      } else {
        socket.emit('chatMessage', {
          sender: currentUser,
          receiver: contact,
          senderImage: image,
          date: moment().format('MMMM Do YYYY, h:mm:ss a'),
          chatroomId: id,
          message,
          type: 'text',
        });
      }
    }
    setMessage('');
    setSelectedFile('');
    setMessageType('');
    setLoaded(0);
  };

  const checkFileNumber = (ev) => {
    const { files } = ev.target;
    setError('');
    if (files.length > 1) {
      setError('Please upload only 1 file.');
      return false;
    }
    return true;
  };

  const checkFileType = (ev) => {
    const { files } = ev.target;
    setError('');
    const types = ['image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4'];
    if (types.every((type) => files[0].type !== type)) {
      setError(
        `Sorry, ${files[0].type} is not a supported format. Please upload a file with one of the following format: 'image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4'.`,
      );
      return false;
    }
    return true;
  };

  const checkFileSize = (event) => {
    const { files } = event.target;
    setError('');
    const size = 20000000;
    if (files[0].size > size) {
      setError(
        `Sorry, ${files[0].type} with ${files[0].size} bytes exceeds the maximum size. Please upload a file with <= 20,000,000 bytes.`,
      );
      return false;
    }
    return true;
  };

  const onChangeUpload = (ev) => {
    const { files } = ev.target;
    if (error !== '') {
      setError('');
    }
    if (checkFileNumber(ev) && checkFileType(ev) && checkFileSize(ev)) {
      setSelectedFile(files);
      setLoaded(0);
    }
  };

  const uploadFile = (ev) => {
    ev.preventDefault();
    if (error !== '') {
      setError('');
    }
    if (selectedFile === '') {
      setError('Please upload something');
      return;
    }
    const data = new FormData();
    for (const key of Object.keys(selectedFile)) {
      data.append('file', selectedFile[key]);
    }
    axios
      .post(`${port}/upload`, data, {
        onUploadProgress: (ProgressEvent) => {
          setLoaded((ProgressEvent.loaded / ProgressEvent.total) * 100);
        },
      })
      .then((res) => {
        setMessage(res.data.path.substring(6));
        setMessageType(res.data.mimetype);
        return res.data;
      })
      .catch((err) => {
        setError(err);
      });
  };

  const displayMsg = (msg) => {
    if (msg.type === 'image/jpeg' || msg.type === 'image/png') {
      return (
        <div>
          <img
            style={{ maxWidth: '200px' }}
            src={`${port}${msg.message}`}
            alt='img'
          />
          <div style={{ marginTop: '10px' }}>
            <a
              href={`${port}${msg.message}`}
              target='_blank'
              rel='noreferrer'
              style={{ textDecoration: 'none', color: 'darkblue' }}
            >
              <em>Click here to open image file in a new window</em>
            </a>
          </div>
        </div>
      );
    }
    if (msg.type === 'audio/mpeg') {
      let audioUrl = '';
      if (msg.message.startsWith('blob')) {
        audioUrl = msg.message;
      } else {
        audioUrl = `${port}${msg.message}`;
      }
      return (
        <div>
          <audio src={audioUrl} alt='audio' type='audio/mpeg' controls />
        </div>
      );
    }
    if (msg.type === 'video/mp4') {
      return (
        <div>
          <video
            style={{ maxWidth: '200px' }}
            src={`${port}${msg.message}`}
            alt='video'
            type='video/mp4'
            controls
          />
          <div style={{ marginTop: '13px' }}>
            <a
              href={`${port}${msg.message}`}
              target='_blank'
              rel='noreferrer'
              style={{ textDecoration: 'none', color: 'darkblue' }}
            >
              <em>Click here to open video file in a new window</em>
            </a>
          </div>
        </div>
      );
    }
    return <p>{msg.message}</p>;
  };

  const onCall = async (e) => {
    e.preventDefault();
    if (!calling) {
      console.log('outgoing call....');
      setCalling(true);
      if (socket) {
        const res = await fetch(`/getsocketid/${contact}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok) {
          socket.emit('outgoing-call', {
            chatroomId: id,
            socketID: data.socketID,
            caller: currentUser,
            receiver: contact,
          });
        } else {
          setCalling(false);
          console.log(`call failed with error: ${data.error}`);
        }
      }
    }
  };

  return (
    <div style={{ gridArea: 'ft' }}>
      <ChatContainer>
        <ChatHeader>
          <div style={{ marginLeft: '30px' }}>
            <h4 style={{ color: 'black' }}>
              Chatroom ID: {id}, User: {currentUser}, Contact: {contact}
              <Button
                size='large'
                onClick={deleteConversation}
                style={{ marginLeft: '7px' }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>{' '}
              Delete Conversation
            </h4>
          </div>
        </ChatHeader>
        <ChatMain>
          <ChatSidebar>
            <ErrorMessage msg={error} />
            <div style={{ marginLeft: '5px', marginTop: '180px' }}>
              <FormButton
                onClick={onCall}
                style={{
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '5px',
                }}
              >
                <FontAwesomeIcon icon={calling ? faSpinner : faVideo} /> Video
                Call
              </FormButton>
              <form method='post' onSubmit={uploadFile}>
                <div>
                  <input
                    id='file'
                    name='file'
                    type='file'
                    onChange={onChangeUpload}
                    style={{ marginTop: '50px', color: 'darkblue' }}
                  />
                </div>
                <LinearProgress
                  variant='determinate'
                  value={loaded}
                  style={{ marginTop: '20px' }}
                >
                  {Math.round(loaded, 2)}%
                </LinearProgress>
                <div>
                  <FormButton
                    style={{
                      marginTop: '20px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '17px',
                    }}
                  >
                    <FontAwesomeIcon icon={faFileUpload} /> Upload File
                  </FormButton>
                </div>
              </form>
            </div>
          </ChatSidebar>
          <ChatMessages ref={ref}>
            {messages.map((msg, idx) => (
              <Message
                key={Math.floor(Math.random() * Math.floor(10000000000))}
              >
                <Meta>
                  <img
                    src={msg.senderImage}
                    alt=''
                    style={{ width: '4%', borderRadius: '50%' }}
                  />{' '}
                  <em
                    style={{
                      fontSize: '1.2em',
                      color: msg.sender === currentUser ? 'purple' : 'green',
                    }}
                  >
                    {msg.sender}
                  </em>{' '}
                  <span style={{ color: '#777' }}>{msg.date}</span>
                  <span style={{ marginLeft: '5px' }}>
                    <Button size='small' onClick={() => deleteMessage(idx)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>{' '}
                    Delete Message
                  </span>
                </Meta>
                {displayMsg(msg)}
              </Message>
            ))}
          </ChatMessages>
        </ChatMain>
        <ChatFormContainer>
          <form id='chat-form' style={{ display: 'flex' }}>
            <input
              id='msg'
              type='text'
              required
              style={{
                fontSize: '16px',
                height: '40px',
                flex: '1',
                marginLeft: '100px',
                autoComplete: 'off',
              }}
              onChange={onChange}
              value={message}
            />
            <FormButton
              onClick={onSubmit}
              style={{
                cursor: 'pointer',
                fontSize: '18px',
                color: 'darkblue',
                marginLeft: '10px',
                marginTop: '2px',
                backgroundColor: 'white',
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} /> Send
            </FormButton>
          </form>
        </ChatFormContainer>
      </ChatContainer>
    </div>
  );
};

MsgView.propTypes = {
  history: PropTypes.object.isRequired,
  socket: PropTypes.object,
  currentUser: PropTypes.string,
  image: PropTypes.string,
};

export default MsgView;
