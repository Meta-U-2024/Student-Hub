import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, TextField, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress'



function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    //handles the submit when logged in.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try{
          console.log('Attempting login')
            const response = await fetch('http://localhost:8080/auth/login',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // checks if the log-in details are correct
            // if correct navigate to the dashboard
            if (response.ok) {
              console.log('Login successful')
                const data = await response.json();

                // check for userId in the data and not undefined
                if (data.userId !== undefined){
                  //store token and userId in sessionstorgae
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userId', data.userId)
                console.log('Stored token userId in sessionStorage', data.userId)

                // Check if the userId exist in the database
                const isValidUser = await checkUserId(data.userId);
                if (isValidUser) {
                  console.log('User is valid. Navigating to /dashboard...');
                  navigate('/dashboard');
                } else {
                  console.log('User is invalid.');
                  setError('Invalid user credentials.');
                }
              } else {
                console.error('userId is undefined in data:', data);
                setError('Invalid server response. Please try again.');
              }

            } else {
              const { error } = await response.json();
              console.error('Login failed:', error);
              setError(error);
            }
          } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please try again.');
          }
        };
        // check database for userId
        const checkUserId = async (userId) => {
          try {
            console.log('checking userId in database')
            console.log('Checking userId in database...');

            const response = await fetch(`http://localhost:8080/auth/user/${userId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
            });

            if (response.ok) {
              const userData = await response.json();
              console.log('User data retrieved:', userData);
              return true;
            } else {
              console.error(`Error fetching user ${userId}:`, response.status);
              return false;
            }

          } catch (error) {
            console.error('Error checking user:', error);
            return false;
          }
        };

            // rendering state
            return (
                <Container maxWidth="sm">
                  <Grid container spacing={2} alignItems="center" justify="center" style={{ minHeight: '80vh' }}>
                    <Grid item xs={12}>
                      <h2> Please Login Into Your Account</h2>
                    </Grid>
                    <Grid item xs={12}>
                      <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="email"
                              label="Email"
                              variant="outlined"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="password"
                              label="Password"
                              variant="outlined"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">Login</Button>
                          </Grid>
                        </Grid>
                      </form>
                    </Grid>
                    {error && (
                      <Grid item xs={12}>
                        <p style={{ color: 'red' }}>{error}</p>
                      </Grid>
                    )}
                  </Grid>
                  {loading && <CircularProgress color="inherit" />}
                </Container>
              );
            }

            export default Login;
