import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faUserTimes } from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage, InfoBlock, InfoLabels, InfoData } from './SharedStyles';

const ProfileBlockBase = styled.div`
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-template-areas: 'pic' 'profile';
  padding: 1em;
  @media (min-width: 500px) {
    grid-template-columns: auto 1fr;
    grid-template-areas: 'pic profile';
    padding: 3em;
  }
`;

const ProfileImage = styled.img`
  grid-area: pic;
  max-width: 150px;
  margin-right: 20px;
  @media (min-width: 500px) {
    max-width: 150px;
  }
`;

const ProfileBase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  grid-area: main;
`;

const ProfileBlock = (props) => (
  <div>
    <ProfileBlockBase>
      <ProfileImage src={props.image} style={{ borderRadius: '50%' }} />
      <InfoBlock>
        <InfoLabels>
          <p>Username:</p>
          <p>Email Address:</p>
          <p>Registration Date:</p>
        </InfoLabels>
        <InfoData>
          <p>{props.username}</p>
          <p>{props.email}</p>
          <p>{props.date}</p>
        </InfoData>
      </InfoBlock>
    </ProfileBlockBase>
    <div style={{ marginBottom: '20px' }}>
      <Link
        id='changePwdLink'
        to={`/changePassword/${props.username}`}
        style={{ textDecoration: 'none' }}
      >
        <FontAwesomeIcon icon={faUserEdit} /> Change Password
      </Link>
    </div>
    <div>
      <Link
        id='deactivateLink'
        to={`/deactivate/${props.username}`}
        style={{ textDecoration: 'none' }}
      >
        <FontAwesomeIcon icon={faUserTimes} /> Deactivate Account
      </Link>
    </div>
  </div>
);

const Profile = (props) => {
  const [state, setState] = useState({
    username: '',
    email: '',
  });

  const fetchUser = (username) => {
    fetch(`/user/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setState(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUser(props.match.params.username);
  }, [props]);

  return (
    <>
      <ProfileBase>
        <ErrorMessage msg={state.error} hide />
        <ProfileBlock {...state} />
      </ProfileBase>
    </>
  );
};

Profile.propTypes = {
  props: PropTypes.object.isRequired,
};

export default Profile;
