import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const PORT = 8000;
const app = express();

app.use(express.json());
app.use(
    cors({
        origin: dotenv.config().parsed.APP_URL,
        methods: ["GET", "POST"],
    })
);

/* ---- Routes ---- */
import { charactersRoute } from "./routes/characters.js";
import { chatRoute } from "./routes/chat.js";

app.use("/api/characters", charactersRoute);
app.use("/api/chat", chatRoute);
/* -------- */

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
