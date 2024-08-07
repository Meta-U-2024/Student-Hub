const express = require('express');
const router = express.Router();
const { User, Notification } = require('../models');
const verifyToken = require('../middleware/auth');
const { Op } = require('sequelize');
const { sendToClients } = require('./sse')

//get route for mentorship information
router.get('/mentorship', verifyToken, async (req, res) => {
  try {

    const userId = req.userId

    // fetch all current mentorship relationships involving the given userId
    const currentMentorships = await User.findAll({
      where: {
        [Op.or]: [
          { mentorId: userId},
          { id: userId}
        ]
      }
    });

    // extract related user IDs
    const relatedUserIds = new Set();
    currentMentorships.forEach(
      user => {
        relatedUserIds.add(user.mentorId);
        relatedUserIds.add(user.id)
      });
      // add current user to the set to exclude
      relatedUserIds.add(userId);

    // fetch all users except current user and their mentors/mentees
    const users = await User.findAll({

      attributes: ['id', 'name', 'profilePicture', 'interest', 'mentorship', 'school'],
      where: {
        id: {
          [Op.ne]: userId 
        },
         mentorship: 'Mentor'
      }
    });

    // format the fetch user information
    const formattedUser = users.map(user => ({
      id: user.id,
      name: user.name,
      profilePicture: user.profilePicture,
      interest: user.interest,
      mentorship: user.mentorship,
      school: user.school,
      bio: user.bio,
    }));

    // return the formatted data
    res.status(200).json({formattedUser});
  } catch (error) {
    console.error('Mentors fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// request a mentor
router.post('/request-mentor', verifyToken, async (req, res) => {
  const { userId, note, mentorId } = req.body

  try{
    const mentor = await User.findByPk(userId);
    if (!mentor || mentor.mentorship !== 'Mentor'){
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // update user's status for mentor request
    await User.update({ mentorId: userId, status: 'requested', note }, { where: { id: userId } });

    // const variable
    const message = `You have a new mentorship request from ${mentee.name}.`

     // Create notification for the mentor
     const mentee = await User.findByPk(userId);
     await Notification.create({
      userId: mentorId,
      type: 'MENTORSHIP_REQUEST',
      message,
    });

    // Send notification via SSE
    sendToClients({
      type: 'MENTORSHIP_REQUEST',
      payload: {
        userId: mentorId,
        message,
      }
    });


    res.status(201).json({ message: 'Mentor request sent successfully' });
  }catch (error) {
    console.error('Request mentor error:', error)
    res.status(500).json({ error: 'Internal server error'})
  }
});

// fetch mentorship request for a mentor
router.get('/mentor-requests', verifyToken, async (req, res) => {
  try {
    const mentorshipRequest = await User.findAll({
      where: {
        mentorship: 'Mentee',
        status: 'requested'
      },
      attributes: ['id', 'name', 'profilePicture', 'interest', 'mentorship', 'note', 'status', 'mentorId'],
    })
    res.status(200).json(mentorshipRequest);
  } catch (error) {
    console.error('Fetch mentorship requests error:', error);
    res.status(500).json({ error: 'Internal server error'})
  }
});

//respond to a mentorship request
router.post('/respond-mentorship', verifyToken, async (req, res) => {
  const { userId,mentorId, status } = req.body;

  try {
    const mentee = await User.findByPk(userId);

    if (!mentee) {
      return res.status(404).json({ error: 'Mentee not found'})
    }

    // Update mentee's status based on accepted or rejected
    if(mentee) {
      await User.update({ status: status}, { where: { id: userId}});

      const message = `Your mentorship request to ${mentor.name} has been ${status}.`

      // notification for the mentee
      const mentor = await User.findByPk(mentorId);
      await Notification.create({
        userId: userId,
        type: 'MENTORSHIP_RESPONSE',
        message,
      });

      // Send notification via SSE
      sendToClients({
        type: 'MENTORSHIP_RESPONSE',
        payload: {
          userId: userId,
          message,
        }
      });
    }

     // Update mentorId only if status is accepted
     if (status === 'accepted')
       {
        await User.update({ mentorId }, { where: { id: userId } });
      }

    res.status(200).json({ message: 'Mentorship status updated successfully'});
  } catch (error) {
    console.error('Respond mentorship error:', error)
    res.status(500).json({ error: 'Internal server error'});
  }
})

// Get user role
router.get('/user-role', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['mentorship']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ userRole: user.mentorship });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Get Mentees List for a mentor
router.get('/:userId/mentees', verifyToken, async (req, res) => {
  try{
    const userId = parseInt(req.params.userId);

    const mentor = await User.findOne({
      where: { id: userId}
    })

    if (!mentor) {
      return res.status(404).json({error: 'No mentor found'})
    }

    const mentees = await mentor.getMentees({
      where: {
        status: 'accepted',
      },
      attributes: ['id', 'name', 'major', 'school', 'interest', 'email', 'profilePicture', 'bio']
    });

    res.status(200).json(mentees)
  }catch (error) {
    console.error('Error fetching mentees:', error);
    res.status(400).json({ error: 'No mentees found for this mentor'})
  }
})

// get mentor list for a mentee
router.get('/:userId/mentor', verifyToken, async (req, res) => {
  try {
    const mentee = await User.findOne({
      where: { id: req.params.userId },
    });

    const mentor = await mentee.getMentor({
      attributes: ['id', 'name', 'profilePicture', 'interest', 'bio', 'email']
    });

    if (!mentee || !mentor){
      return res.status(404).json({ error: 'No mentor found'})
    }
    const mentorData = [mentor];
    res.status(200).json(mentorData);
  }catch(error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ error: 'Internal server error'})
  }
});

module.exports = router;
