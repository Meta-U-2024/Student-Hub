import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Button, Modal, Backdrop, TextField, Input } from '@mui/material';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    profilePicture: '',
    bio: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    school: '',
    major: '',
    interest: '',
    mentorship: '',
  });
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found in sessionStorage');
        }
// profile page fetch from the server
        const response = await fetch('http://localhost:8080/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch profile.');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError('Failed to fetch profile.');
      }
    };

    fetchProfile();
  }, []);
//request to submit profile page update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        handleClose();
      } else {
        setError('Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile.');
    }
  };
//profile change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value !== undefined) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        [name]: value,
      }));
    }
  };
// upload a profile picture
// connects with the server using multer to upload and save in uploads file which is in the backend
  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('http://localhost:8080/profile/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prevProfile) => ({
          ...prevProfile,
          profilePicture: `http://localhost:8080/${data.profilePicture}`,
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload profile picture.');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setError('Failed to upload profile picture.');
    }
  };


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (error) {
    return (
      <Container maxWidth="sm">
        <Grid container spacing={2} alignItems="center" justify="center" style={{ minHeight: '80vh' }}>
          <Grid item xs={12}>
            <Typography variant="h5" color="error">
              {error}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm">
        <Grid container spacing={2} alignItems="center" justify="center" style={{ minHeight: '80vh' }}>
          <Grid item xs={12}>
            <Typography variant="h5">
              Loading profile...
            </Typography>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2} alignItems="center" justify="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4">
            Profile Details
          </Typography>
        </Grid>
        <Grid item xs={12}>
              {profile.profilePicture && (
                <img src={profile.profilePicture} alt="Profile" style={{ maxWidth: '20%', marginTop: 20 }} />
              )}
            </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            Name: {profile.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Bio: {profile.bio || 'No bio provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Email: {profile.email}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Phone number: {profile.phone || 'No phone number provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Address: {profile.address || 'No address provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            City: {profile.city || 'No city provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            State: {profile.state || 'No state provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            School: {profile.school || 'No school provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Major: {profile.major || 'No major provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Interest: {profile.interest || 'No interest provided'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Mentorship status: {profile.mentorship || 'Mentorship status not specified'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Edit
          </Button>
        </Grid>

        {profile && (
      <Modal
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >

    <div style={{ backgroundColor: '#fff', padding: 5, borderRadius: 10 }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} columns={2}>
                <Grid item xs={12}>
                      {profile.profilePicture && (
                        <img src={profile.profilePicture} alt="Profile" style={{ maxWidth: '20%', marginTop: 20 }} />
                      )}
                    </Grid>

                    <Grid item xs={12}>
          <Input type="file" onChange={handlePictureUpload} />
          </Grid>
          <Grid item xs={1}>
          <TextField
              fullWidth
              type="text"
              label="Name"
              variant="outlined"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="Bio"
              variant="outlined"
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="Phone"
              variant="outlined"
              name="phone"
              value={profile.phone || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="Address"
              variant="outlined"
              name="address"
              value={profile.address || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="City"
              variant="outlined"
              name="city"
              value={profile.city || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="State"
              variant="outlined"
              name="state"
              value={profile.state || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="School"
              variant="outlined"
              name="school"
              value={profile.school || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="Major"
              variant="outlined"
              name="major"
              value={profile.major || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="Interest"
              variant="outlined"
              name="interest"
              value={profile.interest || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="text"
              label="Mentorship"
              variant="outlined"
              name="mentorship"
              value={profile.mentorship || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={1}>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button variant="contained" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>

</Modal>
)}
      </Grid>
    </Container>
  );
}

export default Profile;
