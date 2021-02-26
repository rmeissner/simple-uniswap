import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, TextField, CardContent, CardHeader, CardActions, Button, Typography } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  card: {
    margin: "16px"
  },
  content: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    marginBottom: "8px"
  }
}));

interface Props {
  input?: string,
  error?: string,
  label?: string,
  className?: string,
  onChange: (value: string) => void
}

const TextFieldWithError: React.FC<Props> = ({input, error, label, className, onChange}) => {
  return (<TextField 
    value={input} 
    error={!!error} 
    helperText={error} 
    label={label} 
    className={className}
    onChange={(e) => onChange(e.target.value)} />);
}

export default TextFieldWithError;
