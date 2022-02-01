import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faUserCircle,
  faHome,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

const HeaderLeftBase = styled.div`
  flex-grow: 1;
  & > h2 {
    color: white;
    margin: 1em 0 1em 1em;
  }
  & > a {
    text-decoration: none;
    & > h2 {
      color: white;
      margin: 1em 0 1em 1em;
    }
  }
`;

const HeaderRightBase = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: ${(props) => (props.vertical ? 'row' : 'column')};
  align-items: ${(props) => (props.vertical ? 'center' : 'flex-end')};
  padding-right: 0.5em;
  & > a {
    color: white;
    padding-right: ${(props) => (props.vertical ? '0.5em' : '0')};
  }
`;

const HeaderBase = styled.div`
  display: flex;
  grid-area: hd;
  background: #00008b;
`;

const HeaderLeft = ({ user }) => (
  <HeaderLeftBase>
    {user !== '' ? (
      <Link to={`/home/${user}`}>
        <h2>
          <FontAwesomeIcon icon={faVideo} /> VideoMessagingApp
        </h2>
      </Link>
    ) : (
      <h2>
        <FontAwesomeIcon icon={faVideo} /> VideoMessagingApp
      </h2>
    )}
  </HeaderLeftBase>
);

const HeaderRight = ({ user }) => {
  const isLoggedIn = user !== '';
  return (
    <HeaderRightBase vertical={isLoggedIn}>
      {isLoggedIn ? (
        <>
          <Link
            id='homeLink'
            to={`/home/${user}`}
            style={{ textDecoration: 'none', marginRight: '10px' }}
          >
            <FontAwesomeIcon icon={faHome} /> Main View
          </Link>
          <Link
            id='statusLink'
            to={`/status/${user}`}
            style={{ textDecoration: 'none', marginRight: '10px' }}
          >
            <FontAwesomeIcon icon={faUsers} /> Status View
          </Link>
          <Link
            id='profileLink'
            to={`/profile/${user}`}
            style={{ textDecoration: 'none', marginRight: '10px' }}
          >
            <FontAwesomeIcon icon={faUserCircle} /> Profile
          </Link>
          <Link id='logoutLink' to='/logout' style={{ textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
          </Link>
        </>
      ) : (
        <>
          <Link id='regLink' to='/register' style={{ textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faUserPlus} /> Register
          </Link>
          <Link id='loginLink' to='/login' style={{ textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faSignInAlt} /> Log In
          </Link>
        </>
      )}
    </HeaderRightBase>
  );
};

const Header = ({ user = '' }) => (
  <HeaderBase>
    <HeaderLeft user={user} />
    <HeaderRight user={user} />
  </HeaderBase>
);

HeaderLeft.propTypes = {
  user: PropTypes.string.isRequired,
};

HeaderRight.propTypes = {
  user: PropTypes.string.isRequired,
};

Header.propTypes = {
  user: PropTypes.string.isRequired,
};

export default Header;
