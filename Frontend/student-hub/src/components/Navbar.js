import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Switch } from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from './ThemeContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NotificationIcon from './NotificationIcon';

function Navbar({ isLoggedIn, setIsLoggedIn}) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsEl, setSettingsEl] = useState(null);
    const { darkMode, toggleDarkMode } = useTheme();

    //Handles logout navigation
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    //handles profile click
    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    //handles the close option
    const handleClose = () => {
        setAnchorEl(null);
    };

    // handles the settings icon
    const handleSettingsClick = (event) => {
        setSettingsEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsEl(null);
    };

    const handleNavigation = (path) => {
        navigate(path);
        handleClose();
        handleSettingsClose();
      };

    //rendering the app to undate.
    //anchorEl used to set the position of the menu.
    return(
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant='h6' align='center' style={{flexGrow: 1}}>
                        Student Hub
                    </Typography>
                    {isLoggedIn ? (
                        <>
                        <Button color='inherit' component={Link} to="/courses">Course & Interest  </Button>
                        <Button color='inherit' component={Link} to="/mentorship"> Mentorship program  </Button>
                        <Button color="inherit" component={Link} to="/friends">Friends</Button>
                        <NotificationIcon />
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleProfileClick}
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                >
                                    <MenuItem onClick={() => handleNavigation('/profile')}>Profile</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                                <IconButton
                                edge="end"
                                color="inherit"
                                onClick={handleSettingsClick}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                <Menu
                                anchorEl={settingsEl}
                                keepMounted
                                open={Boolean(settingsEl)}
                                onClose={handleSettingsClose}
                                >
                                    <MenuItem>
                                        <Switch checked={darkMode} onChange={toggleDarkMode} />
                                        Dark Mode
                                    </MenuItem>
                                    <MenuItem onClick={() => handleNavigation ('/feedback')}>Feedback</MenuItem>
                                    <MenuItem onClick={() =>  handleNavigation('/contact')}>Contact Me</MenuItem>
                                    <MenuItem onClick={() =>  handleNavigation('/about')}>About</MenuItem>
                                </Menu>
                        </>
                    ) : (
                        undefined
                    )}
                </Toolbar>
            </AppBar>
        );
    }


export default Navbar;
