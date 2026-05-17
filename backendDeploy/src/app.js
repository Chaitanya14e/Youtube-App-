import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
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

//routes declaration
app.use("/user",userRoot)
app.use("/video", videoRoute);
export {app}