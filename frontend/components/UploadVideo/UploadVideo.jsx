import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clapperboard, ImagePlus, Upload, Video } from "lucide-react";
import { toast } from "react-toastify";
import { publishVideo } from "../../src/lib/api";
import "./UploadVideo.css";

export default function UploadVideo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!videoFile || !thumbnail) {
      toast.error("Choose a video and a thumbnail before uploading.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);
      await publishVideo(formData);
      toast.success("Your video is live!");
      navigate("/home");
    } catch (error) {
      toast.error(error.message || "Your video couldn't be uploaded.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="upload-page">
      <header className="upload-header">
        <Link className="upload-brand" to="/home">
          <span className="upload-brand-mark">
            <Clapperboard size={18} fill="currentColor" />
          </span>
          FunTube
        </Link>
        <Link className="upload-back-link" to="/home">
          <ArrowLeft size={17} />
          Back to feed
        </Link>
      </header>

      <section className="upload-panel">
        <div className="upload-heading">
          <span className="upload-heading-icon">
            <Upload size={20} />
          </span>
          <div>
            <h1>Upload a video</h1>
            <p>Share something worth watching.</p>
          </div>
        </div>

        <form className="upload-form" onSubmit={submitHandler}>
          <label className="upload-field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              placeholder="Add a title that tells viewers what your video is about"
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label className="upload-field">
            <span>Description</span>
            <textarea
              name="description"
              placeholder="Tell viewers a little more about your video"
              value={description}
              rows={5}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>

          <div className="upload-files">
            <label className="file-drop">
              <Video size={23} />
              <strong>Video file</strong>
              <span>{videoFile?.name || "Choose a video from your device"}</span>
              <input
                type="file"
                accept="video/*"
                onChange={(event) =>
                  setVideoFile(event.target.files?.[0] || null)
                }
                required
              />
            </label>

            <label className="file-drop">
              <ImagePlus size={23} />
              <strong>Thumbnail</strong>
              <span>{thumbnail?.name || "Choose a thumbnail image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setThumbnail(event.target.files?.[0] || null)
                }
                required
              />
            </label>
          </div>

          <p className="upload-hint">
            Add a clear thumbnail so viewers know what they’re about to watch.
          </p>

          <div className="upload-footer">
            <Link to="/home">Cancel</Link>
            <button className="publish-button" type="submit" disabled={isUploading}>
              {isUploading ? "Uploading…" : "Publish video"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
