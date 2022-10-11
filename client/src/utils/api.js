import axios from "axios";

export async function getFollowingPosts(id) {
  return await axios.get(`/posts/timeline/${id}`);
}

export async function getAllPosts() {
  return await axios.get(`/posts/timeline/all`);
}

export async function getUserById(id) {
  return await axios.get(`/users?userId=${id}`);
}

export async function getUserByUsername(username) {
  return await axios.get(`/users?username=${username}`);
}

export async function getUserPosts(username) {
  return await axios.get(`/posts/profile/${username}`);
}

export async function loginCall(userCredentials, dispatch) {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("auth/login", userCredentials);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
  } catch (error) {
    dispatch({ type: "LOGIN_FAILURE", payload: error });
  }
}

export async function registerUser(user) {
  return await axios.post("/auth/register", user);
}

export async function likeDislikePost(postId, userId) {
  return await axios.put(`/posts/${postId}/like`, { userId: userId });
}

export async function sendComment(comment) {
  console.log({ comment });
  return await axios.post(`/comments`, comment);
}

export async function getPostComments(postId) {
  return await axios.get(`/comments/${postId}`);
}

export async function sharePost(post) {
  return await axios.post("/posts", post);
}

export async function getPost(postId) {
  return await axios.get(`/posts/${postId}`);
}

export async function uploadImage(data) {
  return await axios.post("/upload", data);
}

export async function getFollowingUsers(userId) {
  return await axios.get(`/users/following/${userId}`);
}

export async function getFollowersUsers(userId) {
  return await axios.get(`/users/followers/${userId}`);
}

export async function followUser(userId, currentUserId) {
  return await axios.put(`/users/${userId}/follow`, { userId: currentUserId });
}

export async function unfollowUser(userId, currentUserId) {
  return await axios.put(`/users/${userId}/unfollow`, {
    userId: currentUserId,
  });
}

export async function deletePost(postId, userId) {
  return await axios.delete(`/posts/${postId}/${userId}`);
}

export async function findMatchingUsernames(username) {
  return await axios.get(`/users/search/${username}`);
}

export async function uploadProfileImage(userId, file) {
  return await axios.put(`/upload/profile-picture/${userId}`, file);
}

export async function uploadCoverPhoto(userId, file) {
  return await axios.put(`/upload/cover/${userId}`, file);
}
