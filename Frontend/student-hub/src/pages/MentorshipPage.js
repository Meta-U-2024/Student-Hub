import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, IconButton, InputBase, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';
import { useError } from '../components/ErrorContext'
import Skeleton from '@mui/material/Skeleton'
import getUserIDToken from '../components/utils';
import UserCard from './UserCard';
import MenteeList from './MenteeList';
import MentorList from './MentorList';
import PendingRequest from './PendingRequest';

//search styling
const SearchContainer = styled(Paper)({
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    marginBottom: '20px'
  })

  const SearchInput = styled(InputBase)({
    marginLeft: '8px',
    flex: 1,
  })

  const SearchIconButton = styled(IconButton)({
    padding: 10,
  });

function MentorshipPage() {
  const [mentorships, setMentorships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const {error, setError } = useError();
  const [isOpenRequestDialog, setIsOpenRequestDialog] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [note, setNote] = useState('');
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [filteredMentorshipRequests, setFilteredMentorshipRequests] = useState([]);
  const [isPendingRequestDialogOpen, setIsPendingRequestDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState(null)
  const [isListOpen, setIsListOpen] = useState(true);
  const [filteredMenteeLists, setFilteredMenteeLists] = useState([]);
  const [filteredMentorLists, setFilteredMentorLists] = useState([]);

  // fetch userRole
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { token } = getUserIDToken();
        const response = await fetch(`${process.env.REACT_APP_API}/mentorship/user-role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          setError('Failed to fetch user role');
        }
        const data = await response.json();
        setUserRole(data.userRole);
      } catch (error) {
        setError('Failed to fetch user role');
      }
    };
    fetchUserRole();
  }, [setError]);

  // fetch mentorship informations
  // delay loading state to 1 minute
const delayTime = 60000;
  useEffect(() => {
    const fetchMentorships = async () => {
      setIsLoading(true)
      try {
        const { token } = getUserIDToken();
        const response = await fetch(`${process.env.REACT_APP_API}/mentorship/mentorship`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('Failed to fetch mentorship')
        }

        const mentorshipData = await response.json();
        const mentors = mentorshipData.formattedUser.filter((user) => user.mentorship === 'Mentor');
        setTimeout(() => {
          setIsLoading(false)
          }, delayTime);
       setMentorships(mentors || []);
      } catch (error) {
        setError('Failed to fetch mentorships');
      }
      setIsLoading(false)
    };
    fetchMentorships();
  }, [setError]);

  // fetch requests received
  useEffect(() => {
    ( async () => {
      try {
        const { token } = getUserIDToken();
        const response = await fetch(`${process.env.REACT_APP_API}/mentorship/mentor-requests`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('Failed to fetch mentorship');
        }
        const requestData = await response.json();
        setMentorshipRequests(requestData);
      }
      catch (error) {
        setError('Fetch mentorshp requests error:', error)
      }
    }) ();
  }, [setError])

  //search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  //request mentor
  const handleRequestMentor = async () => {
    try {
      const { token } = getUserIDToken();
      const response = await fetch(`${process.env.REACT_APP_API}/mentorship/request-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: selectedMentorId, note })
      });

      if (!response.ok) {
        setError('Failed to fetch mentorship');
      }
      alert('Mentor request sent successfuly');
      handleCloseRequestDialog();
    } catch (error) {
      setError('Error requesting mentor:', error)
    }
  };

  // respond to a mentorship request.
  const handleRespondMentorship = async (userId,mentorId, status) => {
    try{
      const { token } = getUserIDToken();
      const response = await fetch(`${process.env.REACT_APP_API}/mentorship/respond-mentorship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId,mentorId, status})
      });

      if (!response.ok) {
        setError('Failed to fetch mentorship');
      }
      const requestData = await response.json();
      setMentorshipRequests(requestData);
      alert(`Mentorship request ${status}`);
      setMentorshipRequests(mentorshipRequests.filter((request) => request.id !== userId))
    }
    catch (error){
      setError('Respond mentorship error', error)
    }
  };

  // fetch mentees information for a mentor
  const fetchMentees = async () => {
    try{
      const { userId, token } = getUserIDToken();

      const response = await fetch(`${process.env.REACT_APP_API}/mentorship/${userId}/mentees`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
        setFilteredMenteeLists(data)
    } catch(error) {
      setError('Error fetching mentees')
    }
  }

  // fetch mentor information for mentee
    const fetchMentor = async () => {
      try {
        const { userId, token } = getUserIDToken();
        const response = await fetch(`${process.env.REACT_APP_API}/mentorship/${userId}/mentor`,{
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data= await response.json();
        setFilteredMentorLists(data)
      } catch (error) {
        setError('Failed to fetch mentor')
      }
    };

  const handleOpenRequestDialog = (userId) => {
    setSelectedMentorId(userId);
    setIsOpenRequestDialog(true);
  };

  const handleCloseRequestDialog = () => {
    setIsOpenRequestDialog(false);
    setSelectedMentorId(null);
    setNote('');
  }

  const handlePendingRequest = () => {
    const pendingRequest = mentorshipRequests.filter(
      (request) => request.mentorship === 'Mentee' && request.status === 'requested'
    );
    setFilteredMentorshipRequests(pendingRequest);
    setIsPendingRequestDialogOpen(true);
  }

  const handleOpenMenteeList = async () => {
    setIsListOpen(true);
   await fetchMentees();
  }
  const handleClosePendingRequest = () => {
    setIsPendingRequestDialogOpen(false);
  }

  const handleCloseMenteeList = () => {
    setIsListOpen(false);
  }
  const handleOpenMentorList = async () => {
    await fetchMentor();
    setIsListOpen(true);
   }
   const handleCloseMentorList = () => {
    setIsListOpen(false);
   }
  const filteredMentorship = mentorships.filter((mentorship) =>
  mentorship.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Grid container spacing={3} alignItems="center" justify="center">
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rect" width="100%" height={150} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
          <Grid item xs={12}>
            <Typography variant="body1" color="error">{error}</Typography>
          </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Grid container spacing={3}>
        <Grid item xs={12}>
        </Grid>

        <Grid item xs={12}>
          <SearchContainer>
            <SearchInput
              placeholder="Search Mentorship"
              value={searchTerm}
              onChange={handleSearch}
            />
            <SearchIconButton>
              <SearchIcon />
            </SearchIconButton>
          </SearchContainer>
        </Grid>
        <Grid item xs={12}>
          {userRole !== 'Mentor' && (
            <>
              {filteredMentorship.map((mentor) => (
                <Grid item xs={12} sm={16} md={8} key={mentor.id} sx={{ p:2}}>
                  <UserCard mentor={mentor} handleOpenRequestDialog={handleOpenRequestDialog} />
                </Grid>
              ))}
            </>
          )}
          { isListOpen && userRole === 'Mentor' && (
            <div>
              <Typography variant="h6" component="h2" gutterBottom>
                Mentees List
              </Typography>
              {filteredMenteeLists.map((mentee) => (
                <MenteeList mentee={mentee} handleCloseMenteeList={handleCloseMenteeList} />
              ))}
            </div>
          )}
        </Grid>
        <Grid item xs={12}>
          { isListOpen && userRole === 'Mentee' && (
            <div>
              <Typography variant="h6" component="h2" gutterBottom>
                My Mentor
              </Typography>
              {filteredMentorLists.map((mentor) => (
                <MentorList mentor={mentor} handleCloseMentorList={handleCloseMentorList} />
              ))}
            </div>
          )}
        </Grid>

      <Dialog open={isOpenRequestDialog} onClose={handleCloseRequestDialog}>
        <DialogTitle>Request Mentorship</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a note explaining why you want this person to be your mentor.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRequestMentor} color="primary">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPendingRequestDialogOpen}
        onClose={handleClosePendingRequest}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Pending Mentorship Requests</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {filteredMentorshipRequests.map((request) => (
              <PendingRequest request={request} handleRespondMentorship={handleRespondMentorship} />
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePendingRequest} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container sx={{ justifyContent: 'space-between' }} item xs={7.5}>
      {userRole === 'Mentor' && (
        <Button onClick={handlePendingRequest} color="primary" variant="contained">
          Pending Requests
        </Button>
      )}
      {userRole === 'Mentor' && (
              <Button onClick={handleOpenMenteeList} color="primary" variant="contained">
                My Mentees
              </Button>
            )}
            </Grid>

      {userRole === 'Mentee' && (
        <Button onClick={handleOpenMentorList} color="primary" variant="contained">
          My Mentor
        </Button>
      )}
      </Grid>
    </Container>
  );
}

export default MentorshipPage;
