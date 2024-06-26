import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import { getFollowingPosts, getAllPosts } from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import NoPosts from "../noPosts/NoPosts";
import LoadingBar from "../loadingBar/LoadingBar";
import PostLoading from "../post/PostLoading";

export default function Feed({ showAllPosts }) {
  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [allPostsRendered, setAllPostsRendered] = useState(false);


  //fetch posts
  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    // get posts for around the world tab
    if (showAllPosts) {
      getAllPosts(abortController.signal).then((response) => {
        setPosts(
          response.data
            //sort results by most recent
            .sort((postA, postB) => {
              return new Date(postB.createdAt) - new Date(postA.createdAt);
            })
            // limit the results to 50
            .slice(0, 50)
        );
        setLoading(false);
      });
    } else {
      //get only following posts
      getFollowingPosts(user._id, abortController.signal).then((response) => {
        setFollowingPosts(
          response.data
            //sort results by most recent
            .sort((postA, postB) => {
              return new Date(postB.createdAt) - new Date(postA.createdAt);
            })
            // limit the results to 50
            .slice(0, 50)
        );
        setLoading(false);
      });
    }
    return () => abortController.abort();
  }, [user._id, showAllPosts]);

  useEffect(() => {
    console.log(document.querySelectorAll(".post").length, posts.length)
    let interval;
    const checkAllPostsRendered = () => {
      const allPosts = showAllPosts ? posts : followingPosts;
      if (allPosts.length > 0 && document.querySelectorAll(".post").length >= allPosts.length) {
        setAllPostsRendered(true);
        clearInterval(interval);
      }
    };

    if (!allPostsRendered) {
      interval = setInterval(checkAllPostsRendered, 1000); // Check every second
    }

    return () => clearInterval(interval);
  }, [posts, followingPosts, showAllPosts, allPostsRendered]);

  return (
    <>
      {loading ? null : (
        <>
          {
            allPostsRendered ? null : <div className='feedPosts feedPostsLoading'><PostLoading /><PostLoading /><PostLoading /><LoadingBar /></div>
          }
          <div className='feedPosts' style={allPostsRendered ? { display: 'block' } : { display: 'none' }}>
            {showAllPosts
              ? posts.map((post) => <Post key={post._id} post={post} />)
              : followingPosts.map((post) => <Post key={post._id} post={post} />)}
          </div>
          <div className="feedNoPosts">
            {followingPosts.length === 0 && !showAllPosts ? (
              <NoPosts message={"no posts here!"} />
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
