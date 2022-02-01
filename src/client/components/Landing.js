import React from 'react';
import styled from 'styled-components';

const LandingBase = styled.div`
  display: flex;
  grid-area: main;
  margin: 30px 0;
  color: darkblue;
`;

const Landing = () => (
  <LandingBase>
    <h1>W E L C O M E</h1>
  </LandingBase>
);

export default Landing;
