import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, TextField, Button } from '@mui/material';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    //handles the submit when logged in.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try{
            const response = await fetch('http://localhost:8080/auth/login',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // checks if the log-in details are correct
            // if correct navigate to the dashboard
            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('token', data.token);
                navigate('/dashboard');
              } else {
                const { error } = await response.json();
                setError(error);
              }
            } catch (error) {
                console.error('Login failed:', error);
                setError('Login failed. Please try again.');
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
                </Container>
              );
            }

            export default Login;
