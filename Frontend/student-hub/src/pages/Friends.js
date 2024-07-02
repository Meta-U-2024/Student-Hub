import React, { useState, useEffect } from 'react';
import { Container, Grid, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Paper, InputBase} from '@mui/material'
import  Remove  from '@mui/icons-material/Remove'
import  Add  from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';

// search styling
const SearchContainer = styled(Paper)({
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
    marginBottom: '20px',
    marginTop: '20px'
});

const SearchInput = styled(InputBase)({
    marginLeft: '8px',
    flex: 1,
});

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [availableFriend, setAvailableFriend] = useState([]);
    const [recommendedFriends, setRecommendedFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState({
        friends: [],
        recommendedFriends: [],
        availableFriend: []
    });

    //fetch data
    useEffect(() => {
        const fetchData = async () => {
            await fetchFriends();
            await fetchAvailableFriend();
            await fetchRecommendedFriends();
        };
        fetchData();
    }, []);


    //initialize filtered data after fetching
    useEffect(() => {
    setFilteredData({
        friends,
        recommendedFriends,
        availableFriend
    });
}, [friends, recommendedFriends, availableFriend]);

// friends
const fetchFriends = async () => {
    try {
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/friends/${userId}`,{
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`}
        });
        if(!response.ok) {
            throw new Error(`failed to fetch friends: ${response.statusText}`);
        }
        //update friends state
        const data = await response.json();
        setFriends(data.filter(person => person.id !== userId));
    }catch (error) {
        console.error('Error fetching friends:', error);
    }
};

//recommended friends
const fetchRecommendedFriends = async () => {
    try{
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/friends/recommendedFriends/${userId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`}
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch recommended friends: ${response.statusText}`);
        }
        //update recommended friends state
        const data = await response.json();
        setRecommendedFriends(data.filter(friend => friend.id !== userId));
    } catch (error) {
        console.error('Error fetching recommended friends:', error);
    }
};

//Available friends
const fetchAvailableFriend = async () => {
    try {
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/friends/available/${userId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`}
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch available friends: ${response.statusText}`);
        }
        //filter out the current user from the available friends
        //update available friends state
        const data = await response.json();
        const filteredAvailableFriend = data.filter(person => person.id !== parseInt(userId));
        setAvailableFriend(filteredAvailableFriend);
        console.log('Available friend:', filteredAvailableFriend);
    } catch (error) {
        console.error('Error fetching available people:', error.message);
    }
};

//add a friend
const handleAddFriend = async (friendId) => {
    try{
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:8080/friends/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, friendId}),
        });

        if (!response.ok) {
            throw new Error(`Failed to add friend: ${response.statusText}`);
        }

        //After successfully adding friend, fetch updated data
        await fetchFriends();
        await fetchAvailableFriend();
        await fetchRecommendedFriends();
    } catch (error) {
        console.error('Error adding friend:', error);
    }
};

//remove a friend
const handleRemoveFriend = async (friendId) => {
    try{
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:8080/friends/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userId, friendId })
        });

        if (!response.ok) {
            throw new Error(`Failed to remove friend: ${response.statusText}`);
        }
        //After successfully removing friend, fetch updated data
        await fetchFriends();
        await fetchAvailableFriend();
        await fetchRecommendedFriends();
    } catch (error) {
        console.error('Error removing friend:', error)
    }
};

// search
const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    //filter friends, recommeded friends and available friend based on search term
    const filteredFriends = friends.filter(person =>
        person.name.toLowerCase().includes(searchTerm) ||
        person.interest.toLowerCase().includes(searchTerm) ||
        person.school.toLowerCase().includes(searchTerm) ||
        person.major.toLowerCase().includes(searchTerm)
        );

    const filteredRecommendedFriends = recommendedFriends.filter(friend =>
        friend.name.toLowerCase().includes(searchTerm)  ||
        friend.interest.toLowerCase().includes(searchTerm) ||
        friend.school.toLowerCase().includes(searchTerm) ||
        friend.major.toLowerCase().includes(searchTerm)
        );

    const filteredAvailableFriend = availableFriend.filter(person =>
        person.name.toLowerCase().includes(searchTerm) ||
        person.interest.toLowerCase().includes(searchTerm) ||
        person.school.toLowerCase().includes(searchTerm) ||
        person.major.toLowerCase().includes(searchTerm)
        );

    //update filtered data
    setFilteredData({
        friends: filteredFriends,
        recommendedFriends: filteredRecommendedFriends,
        availableFriend: filteredAvailableFriend
    });
};


//rendering
return (
    <Container maxwidth="sm">
        <Grid container spacing={2} alignItems="center" justify="center" style={{ minHeight: '80vh'}}>
            {/*Search bar */}
            <Grid item xs={12}>
                <SearchContainer>
                    <SearchInput
                    placeholder="Search Friends"
                    inputProps={{ 'aria-label': 'search Friends'}}
                    value={searchTerm}
                    onChange={handleSearch}
                    />
                    <IconButton aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </SearchContainer>
            </Grid>
            {/* Friends List */}
            <Grid item xs={12}>
                <Typography variant="h5">Friends</Typography>
                <List>
                    {filteredData.friends.map((person) => (
                        <ListItem key={person.id}>
                            <ListItemText primary={person.name} secondary={`${person.interest}, ${person.school}, ${person.major}`} />
                            <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveFriend(person.id)}>
                                <Remove />
                            </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Grid>
            {/* Recommended Friends */}
            <Grid item xs={12}>
                <Typography variant="h6">Recommended Friends</Typography>
                <List>
                    {filteredData.recommendedFriends.map((friend) => (
                        <ListItem key={friend.id}>
                            <ListItemText primary={friend.name || 'Name not available'} secondary={`${friend.interest || 'Interest not found'}, ${friend.school || 'School not found'}, ${friend.major || 'Major not found'}`} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label='add' onClick={() => handleAddFriend(friend.id)}>
                                    <Add />
                                </IconButton>
                                <IconButton end="end" aria-label='remove' onClick={() => handleRemoveFriend(friend.id)}>
                                    <Remove />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Grid>
            {/* Available friend */}
            <Grid item xs={12}>
                <Typography variant="h6">Avaialble People</Typography>
                <List>
                    {filteredData.availableFriend.map((person) => (
                        <ListItem key={person.id}>
                            <ListItemText primary={person.name} secondary={`${person.interest}, ${person.school}, ${person.major}`} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label='add' onClick={() => handleAddFriend(person.id)}>
                                    <Add />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Grid>
        </Grid>
    </Container>
);
};

export default FriendsList;
