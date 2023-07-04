import express from "express";
import dotenv from "dotenv";
import axios from "axios";

import { chatLimiter } from "../config/rateLimits.js";

const router = express.Router();

/* --- /chat ---
/* Sends a message to Open API completions endpoint, and returns the completion  */

router.post("/", chatLimiter, async (req, res) => {
    const character = req.body.character;
    const messages = [
        {
            role: "system",
            content: `You are the medieval fantasy character at the end of this prompt. The user is an adventurer seeking for a new member for their party. Use are both in a tavern. You must answer in first person, as if you were the character, following the instructions in the "SPEECH PATTERN" section. Your function is to chat to the user and talk about yourself, not help them, so do not be overly polite and helpful. Do not answer questions not related to your character, and never refer to yourself as an AI model. The character:
            NAME:<${character.name}>
            SUMMARY:<${character.prompt}>
            SPEECH PATTERN:<${character.speechPattern}>
            CHARACTERISTICS:<${character.characteristics}>
            CONNECTIONS:<${character.connections}>
            BACKSTORY:<${character.background}>`,
        },
        ...req.body.messages,
    ];

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: messages,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dotenv.config().parsed.OPEN_API_KEY}`,
                },
            }
        );
        res.status(200).json(response.data);
    } catch (error) {
        console.log("ERROR");
        console.log(error);

        if (error.status) {
            res.status(error.status).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

export { router as chatRoute };
