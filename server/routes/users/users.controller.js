const router = require("express").Router();
const asyncErrorBoundary = require("../../errors/asyncErrorBoundary");
const hasProperties = require("../../errors/hasProperties");
const User = require("../../models/User");
const bcrypt = require("bcrypt");

//validation functions
//user exists in database
async function userExists(req, res, next) {
  let user;
  if (req.query.username) {
    user = await User.findOne({ username: req.query.username });
  } else if (req.query.userId) {
    user = await User.findById(req.query.userId);
  } else if (req.params.userId) {
    user = await User.findById(req.params.userId);
  } else {
    next({
      message: `please add a userId to this request`,
      status: 400,
    });
  }

  if (!user) {
    next({
      message: `user not found`,
      status: 404,
    });
  } else {
    const { password, updatedAt, notifications, ...other } = user._doc;
    res.locals.user = other;
    next();
  }
}

//pet name is unique
async function petNameUnique(req, res, next) {
  const user = await User.findOne({ username: req.body.data.username });
  const foundName = user.pets.find(
    (pet) => pet.username === req.body.data.name
  );
  if (foundName) {
    next({
      message: `name already exists`,
      status: 400,
    });
  } else {
    next();
  }
}

//get matching usernames // errors handled
async function search(req, res) {
  const searchedUsername = req.params.username;
  const foundUsers = await User.find({
    username: { $regex: searchedUsername, $options: "i" },
  });
  res.status(200).json(foundUsers);
}

//get a user //errors handled
async function read(req, res, next) {
  const user = res.locals.user;
  res.status(200).json(user);
}

// get the following users //errors handled
async function listFollowing(req, res) {
  const user = res.locals.user;

  const following = await Promise.all(
    user.following.map((followingId) => {
      return User.findById(followingId);
    })
  );
  let friendList = [];
  following.map((person) => {
    const { _id, username, profilePicture } = person;
    friendList.push({ _id, username, profilePicture });
  });

  res.status(200).json(friendList);
}

//get followers //errors handled
async function listFollowers(req, res) {
  const user = res.locals.user;
  const followers = await Promise.all(
    user.followers.map((followerId) => {
      return User.findById(followerId);
    })
  );
  let friendList = [];
  followers.map((person) => {
    const { _id, username, profilePicture } = person;
    friendList.push({ _id, username, profilePicture });
  });
  res.status(200).json(friendList);
}

//follow a user // change it into follow/unfollow //TODO
async function updateFollow(req, res) {
  //check that its not the same user
  if (req.body.userId === req.params.userId) {
    res.status(403).json("you can't follow your account");
  }
  // find the current user and the followed user
  const user = await User.findById(req.params.userId);
  const currentUser = await User.findById(req.body.userId);

  // check that they're not already followed
  if (!user.followers.includes(req.body.userId)) {
    // add to followers and following
    await user.updateOne({ $push: { followers: req.body.userId } });
    await currentUser.updateOne({ $push: { following: req.params.userId } });

    //send notifications
    await user.updateOne({
      $push: {
        notifications: {
          desc: `${currentUser.username} followed you`,
          username: currentUser.username,
          opened: false,
        },
      },
    });
    res.status(200).json("user followed successfully");
  } else {
    //TODO: unfollow
    res.status(403).json("you already follow this user!");
  }
}

//unfollow a user //TODO switch to follow/unfollow
async function updateUnfollow(req, res) {
  //check that its not the same user
  if (req.body.userId === req.params.userId) {
    res.status(403).json("you can't unfollow your account");
  }
  // find the current user and the followed user
  const user = await User.findById(req.params.userId);
  const currentUser = await User.findById(req.body.userId);

  // check that they're not already followed
  if (user.followers.includes(req.body.userId)) {
    // add to followers and following
    await user.updateOne({ $pull: { followers: req.body.userId } });
    await currentUser.updateOne({ $pull: { following: req.params.userId } });
    res.status(200).json("user unfollowed successfully");
  } else {
    res.status(403).json("you don't follow this user!");
  }
}

//change profile picture //errors handled
async function updatePicture(req, res) {
  const img = req.body.data.img;
  const user = await User.findById(req.params.userId);
  await user.updateOne({ profilePicture: img });
  res.status(200).json("profile picture updated!");
}

//change cover photo //errors handled
async function updateCover(req, res) {
  const cover = req.body.data.cover;
  const user = await User.findById(req.params.userId);
  await user.updateOne({ coverPhoto: cover });
  res.status(200).json("cover picture updated!");
}

//delete user
async function remove(req, res) {
  if (req.body.userId === req.params.userId) {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(204).json("Account has been deleted");
  } else {
    return res.status(403).json("you cannot make changes to this account");
  }
}

//change opened notifications to read
async function clearNotifications(req, res) {
  const user = await User.findById(req.params.userId);
  let notifications = user.notifications;
  notifications.forEach((notification) => (notification.opened = true));
  console.log(notifications);
  await user.updateOne({ $set: { notifications: notifications } });
  res.status(200).json("notifications cleared");
}

//check if currentuser follows user
async function isAFollower(req, res) {
  const { userId, currentUserId } = req.params;
  if (!userId || !currentUserId) {
    next({
      message: `this request requires a username and a userId`,
      status: 400,
    });
  }

  let currentUser = await User.findById(req.params.currentUserId);
  let result = currentUser.following.includes(userId);
  console.log({ result });
  res.status(200).json(result);
}

//get user notifications
async function listNotifications(req, res) {
  const user = await User.findById(req.params.userId);
  res.status(200).json(user.notifications);
}

//create new pet
async function createPet(req, res) {
  const user = await User.findOne({ username: req.body.data.username });
  const updated = await user.updateOne({ $push: { pets: req.body.data } });
  res.status(201).json(updated);
}

module.exports = {
  delete: [asyncErrorBoundary(remove)],
  read: [userExists, asyncErrorBoundary(read)],
  updatePicture: [
    userExists,
    hasProperties("img"),
    asyncErrorBoundary(updatePicture),
  ],
  updateCover: [
    userExists,
    hasProperties("cover"),
    asyncErrorBoundary(updateCover),
  ],
  updateFollow: [asyncErrorBoundary(updateFollow)],
  updateUnfollow: [asyncErrorBoundary(updateUnfollow)],
  listFollowers: [asyncErrorBoundary(userExists), asyncErrorBoundary(listFollowers)],
  listFollowing: [asyncErrorBoundary(userExists), asyncErrorBoundary(listFollowing)],
  search: [asyncErrorBoundary(search)],
  isAFollower: [asyncErrorBoundary(isAFollower)],
  clearNotifications: [asyncErrorBoundary(userExists), asyncErrorBoundary(clearNotifications)],
  listNotifications: [asyncErrorBoundary(userExists), asyncErrorBoundary(listNotifications)],
  createPet: [asyncErrorBoundary(petNameUnique), asyncErrorBoundary(createPet)],
  //   update: [asyncErrorBoundary(update)],
};
