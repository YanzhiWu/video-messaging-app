import React from 'react';
import styled from 'styled-components';

const ErrorBase = styled.div`
  display: flex;
  padding-top: 2em;
  color: #dc3545;
`;

export const ErrorMessage = ({ msg = '', hide = false }) => (
  <ErrorBase style={{ display: hide ? 'none' : '', textAlign: 'center' }}>
    {msg}
  </ErrorBase>
);

const NotifyBase = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  background: rgba(255, 255, 255, 0.75);
`;

const NotifyBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2em;
  border: 1px solid #000;
  border-radius: 3px;
  background: #fff;
`;

export const Notify = ({ msg = '', onAccept, ...props }) => (
  <NotifyBase {...props}>
    <NotifyBox>
      <p>{msg}</p>
      {onAccept ? (
        <FormButton onClick={onAccept} style={{ color: 'white' }}>
          Ok
        </FormButton>
      ) : null}
    </NotifyBox>
  </NotifyBase>
);

export const FormBase = styled.form`
  display: grid;
  grid-template-columns: 15% 85%;
  grid-auto-rows: minmax(10px, auto);
  padding: 0.1em;
  @media (min-width: 500px) {
    padding: 1em;
  }
`;

export const FormLabel = styled.label`
  text-align: right;
  padding: 0.5em 0.5em;
  font-weight: bold;
`;

export const FormInput = styled.input`
  width: 75%;
  margin: 0.5em 0;
  padding-left: 5px;
`;

export const FormButton = styled.button`
  max-width: 200px;
  min-width: 150px;
  max-height: 2em;
  line-height: 2em;
  border: none;
  border-radius: 5px;
  background: darkblue;
`;

export const InfoBlock = styled.div`
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto 1fr;
  grid-template-areas: 'labels info';
`;

export const InfoData = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  & > p {
    margin: 0.55em 0.25em;
  }
`;

export const InfoLabels = styled(InfoData)`
  font-weight: bold;
  align-items: flex-end;
`;
