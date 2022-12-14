import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import Welcome from "./pages/welcome/Welcome";
import { Switch, Route, Redirect } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import SinglePost from "./pages/singlePost/SinglePost";
import Search from "./pages/search/Search";
import NotFound from "./pages/notFound/NotFound";
import TopBar from "./components/topbar/TopBar";

function App() {
  const { user, dispatch } = useContext(AuthContext);

  if (!user) {
    let storedUser = localStorage.getItem("storedUser");
    if (storedUser) {
      storedUser = JSON.parse(storedUser);
      dispatch({ type: "LOGIN_SUCCESS", payload: storedUser });
    }
  }

  return (
    <Switch>
      <Route exact path="/">
        {user ? (
          <>
            <TopBar />
            <Home />
          </>
        ) : (
          <Welcome />
        )}
      </Route>
      <Route path="/welcome">
        <Welcome />
      </Route>
      <Route path="/search">
        <TopBar />
        <Search />
      </Route>
      <Route path="/login">{user ? <Redirect to="/" /> : <Login />}</Route>
      <Route path="/register">
        {user ? <Redirect to="/" /> : <Register />}
      </Route>
      <Route path="/profile/:username">
        <TopBar />
        <Profile />
      </Route>
      <Route path="/posts/:postId">
        <TopBar />
        <SinglePost />
      </Route>
      <Route>
        <TopBar />
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;
