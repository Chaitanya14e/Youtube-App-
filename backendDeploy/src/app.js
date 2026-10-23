import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fun-tube-app.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static('public'))
app.use(cookieParser())

//routes import
import userRoot from "./routes/user.routes.js"
import videoRoute from "./routes/video.routes.js";
import commentRoute from "./routes/comment.routes.js";
import likeRoute from "./routes/like.routes.js";
import playlistRoute from "./routes/playlist.routes.js";
import subscriptionRoute from "./routes/subscription.routes.js";
import tweetRoute from "./routes/tweet.routes.js";
import dashboardRoute from "./routes/dashboard.routes.js";
import healthcheckRoute from "./routes/healthcheck.routes.js";

//routes declaration
app.use("/user",userRoot)
app.use("/video", videoRoute);
app.use("/comment", commentRoute);
app.use("/like", likeRoute);
app.use("/playlist", playlistRoute);
app.use("/subscription", subscriptionRoute);
app.use("/tweet", tweetRoute);
app.use("/dashboard", dashboardRoute);
app.use("/healthcheck", healthcheckRoute);
export {app}