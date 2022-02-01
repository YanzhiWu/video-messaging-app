import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Logout = ({ history, logOut }) => {
  useEffect(() => {
    logOut();
    history.push('/login');
  }, []);
  return <div></div>;
};

Logout.propTypes = {
  history: PropTypes.object.isRequired,
  logOut: PropTypes.func.isRequired,
};

export default Logout;
