import { useState } from "react";
import "./UploadVideo.css";
import { publishVideo } from "../../src/lib/api";
import { useNavigate } from "react-router-dom";

function UploadVideo() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      await publishVideo(formData);

      alert("Video uploaded successfully");

      navigate("/home");
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <div id="content">
      <div id="container">
        <h1>Upload Video</h1>
        <form id="form1" onSubmit={submitHandler}>

          <div className="details">

            <label htmlFor="title">
              Enter title
            </label>

            <br />

            <input
              type="text"
              id="title"
              placeholder="Enter Title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <br />

            <label htmlFor="description">
              Enter description
            </label>

            <br />

            <textarea
              id="description"
              placeholder="Enter Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

          <div className="upload">

            <label htmlFor="video">
              Upload Video
            </label>

            <br />

            <input
              type="file"
              id="video"
              className="fupload"
              accept="video/*"
              onChange={(e) =>
                setVideoFile(e.target.files[0])
              }
            />

            <br />

            <label
              htmlFor="thumbnail"
              className="thumb"
            >
              Upload Thumbnail
            </label>

            <br />

            <input
              type="file"
              id="thumbnail"
              className="fupload"
              accept="image/*"
              onChange={(e) =>
                setThumbnail(e.target.files[0])
              }
            />

            <button id="uploadbtn">
              Upload Video
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}

export default UploadVideo;