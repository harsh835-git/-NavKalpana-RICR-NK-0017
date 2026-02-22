import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import authRouter from "./src/routers/authRouter.js";
import connectDB from "./src/config/db.js";

dotenv.config();
const app = express();

// Fixes 'port is not defined' error
const port = process.env.PORT || 4500; 

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/auth", authRouter);

app.listen(port, async () => {
    console.log("🚀 Server Started at Port: ", port);
    await connectDB();
});