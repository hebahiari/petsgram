import "./share.css";
import { PermMedia, EmojiEmotions, Cancel } from "@mui/icons-material";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { sharePost, uploadImage } from "../../utils/api";
import { useHistory } from "react-router-dom";
import AddPet from "../../components/addPet/AddPet";
import AddPetForm from "../addPet/AddPetForm";

export default function Share() {
  const { user } = useContext(AuthContext);
  const desc = useRef();
  const pets = useRef();
  const [file, setFile] = useState("");
  const history = useHistory();
  const [error, setError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (user.username !== "guest-user") {
      const newPost = {
        userId: user._id,
        desc: desc.current.value,
      };
      // if the new posts includes a file when submitting
      if (file) {
        const data = new FormData();
        data.append("name", file.name);
        data.append("file", file);
        newPost.img = file.location;
        try {
          uploadImage(data)
            .then((response) => {
              newPost.img = response.data;
            })
            .then(() => sharePost(newPost).then(history.go()));
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          sharePost(newPost).then(history.go());
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      setError(true);
    }
  };

  const handleChange = () => {
    console.log("changing ....");
    if (pets.value.current == "add") {
      return <AddPetForm />;
    }
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <form className="shareForm" onSubmit={handleSubmit}>
          <div className="shareTop">
            <img className="shareProfileImg" src={user.profilePicture} alt="" />
            <input
              placeholder={`What would you like to share today, ${user.username}?`}
              type="text"
              className="shareInput"
              required
              ref={desc}
            />
          </div>
          <hr className="shareHr" />
          {file ? (
            <div className="shareImgContainer">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="shareImg"
              />
              <Cancel className="shareDiscard" onClick={() => setFile(null)} />
            </div>
          ) : null}
          <div className="shareBottom">
            <label htmlFor="file" className="shareOption">
              <PermMedia className="shareIcon" />
              <span className="shareOptionText">Media</span>
              {!file ? (
                <select
                  ref={pets}
                  className="shareTags"
                  name="animals"
                  required
                  style={{ paddingLeft: "10px" }}
                  onChange={handleChange}
                >
                  <option value=""> Tag pet</option>
                  {user.pets.map((pet) => (
                    <option value={`${pet.name.toLowerCase()}`}>
                      {pet.name}
                    </option>
                  ))}
                  <option value="add" onClick={() => console.log("hi")}>
                    Add new pet
                  </option>
                  <option value="other">Other</option>
                </select>
              ) : null}
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpg,.jpeg"
                onChange={(event) => setFile(event.target.files[0])}
              ></input>
            </label>
            <button className="shareButton" type="submit">
              Share
            </button>
          </div>
        </form>
        {error ? (
          <div className="shareError">
            You are using a guest account, please sign up to use this feature
          </div>
        ) : null}
      </div>
    </div>
  );
}
