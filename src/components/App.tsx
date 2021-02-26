import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import { ThemeProvider } from '@material-ui/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import CssBaseline from '@material-ui/core/CssBaseline'
import Root from './Root'

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(() => createMuiTheme({
    palette: {
      type: prefersDarkMode ? 'dark' : 'light',
      primary: blue,
    },
  }), [prefersDarkMode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root />
    </ThemeProvider>
  );
}

export default App;
