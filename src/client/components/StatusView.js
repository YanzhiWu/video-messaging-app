import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  ErrorMessage,
  FormBase,
  FormLabel,
  FormInput,
  FormButton,
} from './SharedStyles';

const Card = styled.div`
  padding: 0.5rem;
  border: #ccc 2px dotted;
  margin: 2px;
`;

const StatusView = ({ currentUser }) => {
  const [status, setStatus] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [error, setError] = useState('');
  const [change, setChange] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (error !== '') {
      setError('');
    }
    if (status === '') {
      setError('Please enter something');
      return;
    }
    let gifImage;
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=E0JCPQXnMrbL8e4R1yX51HEAsZojsHz0&q=${status}&limit=10&rating=g`,
      );
      const json = await response.json();
      const random = Math.floor(Math.random() * 10);
      if (json.data.length !== 0 && json.data[random] !== undefined) {
        gifImage = json.data[random].images.downsized.url;
      }
      const data = {
        status,
        gifImage,
      };
      await fetch(`/addstatus/${currentUser}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
      });
      setStatus('');
      setChange(!change);
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      const res = await fetch(`/statuses/${currentUser}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
      });
      const data = await res.json();
      setStatuses(data.statuses);
    };
    fetchStatuses();
  }, [change, currentUser]);

  return (
    <div style={{ gridArea: 'ft', margin: '0 50px' }}>
      <ErrorMessage msg={error} />
      <FormBase>
        <FormLabel htmlFor='status'>New Status:</FormLabel>
        <FormInput
          id='status'
          name='status'
          type='text'
          placeholder='Type something ~ (i.e., happy, sad, tired)'
          value={status}
          onChange={(ev) => {
            setStatus(ev.target.value.toLowerCase());
            setChange(!change);
          }}
        />
        <div />
        <FormButton
          id='submitBtn'
          onClick={onSubmit}
          style={{ color: 'white', cursor: 'pointer' }}
        >
          Post Status
        </FormButton>
      </FormBase>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
        }}
      >
        {statuses.map((each) => (
          <Card
            key={
              Math.floor(Math.random() * Math.floor(10000000000)) +
              Math.floor(Math.random() * Math.floor(10000000000))
            }
            style={{ textAlign: 'center' }}
          >
            <div>
              <img
                src={each.userImage}
                alt=''
                style={{ borderRadius: '50%', width: '30px' }}
              />{' '}
              <em style={{ color: 'darkblue', fontSize: '1.5em' }}>
                {each.user}
              </em>
              : {each.status}
            </div>
            <img
              src={each.gifImage}
              alt=''
              style={{
                margin: '10px 0',
                width: '20%',
                borderRadius: '30%',
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

StatusView.propTypes = {
  currentUser: PropTypes.string.isRequired,
};

export default StatusView;
