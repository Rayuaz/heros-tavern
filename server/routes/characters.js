import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import stream from "stream";

import standardLimiter from "../config/rateLimits.js";
import pb from "../config/pocketbaseConfig.js";

const router = express.Router();

/* --- /characters/random --- 
/* Returns a random character */

router.get("/random", standardLimiter, async (req, res) => {
    const races = req.query.races || [];
    const classes = req.query.classes || [];

    let filters = "";

    addToFilter(races, "race");
    if (races.length && classes.length) {
        filters += " && ";
    }
    addToFilter(classes, "class");

    function addToFilter(array, label) {
        const arrayLength = array.length;

        if (arrayLength > 0) {
            filters += "(";

            for (let i = 0; i < arrayLength; i++) {
                const item = array[i];
                filters += `${label} = "${item}"`;

                if (i + 1 == arrayLength) {
                    filters += ")";
                } else {
                    filters += " || ";
                }
            }
        }
    }

    try {
        const data = await pb.collection("characters").getFirstListItem(filters, {
            sort: "@random",
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);

        if (error.status) {
            res.status(error.status).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

/* --- /characters/:characterId ---
/* Returns a specific character */

router.get("/:characterId", standardLimiter, async (req, res) => {
    const characterId = req.params.characterId;

    try {
        const data = await pb.collection("characters").getOne(characterId);
        res.status(200).json(data);
    } catch (error) {
        console.log(error);

        if (error.status) {
            res.status(error.status).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

/* --- /characters/:characterId/background ---
/* Generates and streams the character background */

router.get("/:characterId/background", standardLimiter, async (req, res) => {
    const characterId = req.params.characterId;
    const character = {};

    try {
        const data = await pb.collection("characters").getOne(characterId);
        character.prompt = data.prompt;
        character.characteristics = data.characteristics;
        character.connections = data.connections;
        character.class = data.class;
        character.speechPattern = data.speechPattern;
    } catch (error) {
        console.log(error);
        res.status(error.status).json(error);
    }

    const userPrompt = `Summary: <${character.prompt}>
    Characteristics: <${character.characteristics}>
    Connections: <${character.connections}>`;

    try {
        res.setHeader("Content-Type", "text/event-stream");

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: `The user will send you a fantasy character. You must write 6 long paragraphs in first person, as if you were the character, in a tavern, explaining to the user your backstory, heavily detailing your orgin${
                            character.class === "Warlock" ? "," : " and"
                        } objectives${
                            character.class === "Warlock" &&
                            ", your warlock patron (if the user prompt doesnt have one, create it), and how you met your patron"
                        }. You must follow these instructions: "${
                            character.speechPattern
                        }". In your introduction, detail where you come from. You may create new information that is not on the user prompt. You must be very detailed about your location of origin and the reasons behind your objectives. You must not explain your Bond, Ideal and Personality trait. Each paragraph must have at least 500 characters. Do not start the last paragraph with "In conclusion"`,
                    },
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dotenv.config().parsed.OPEN_API_KEY}`,
                },
                responseType: "stream",
            }
        );

        const writableStream = new stream.Writable();
        const streamData = [];
        writableStream._write = (chunk, encoding, next) => {
            const chunkData = chunk.toString();
            const match = chunkData.match(/"content":"([^"]*)"/);
            if (match) {
                streamData.push(match[1]);
            }
            next();
        };

        response.data.pipe(writableStream);
        response.data.pipe(res);

        writableStream.on("finish", async () => {
            const result = streamData.join("");

            try {
                await pb.collection("characters").update(characterId, {
                    background: result,
                });
            } catch (error) {
                console.log(error);
                res.json(error);
            }
        });
    } catch (error) {
        console.log(error);

        if (error.status) {
            res.status(error.status).json(error);
        } else {
            res.status(500).json(error);
        }
    }
});

export { router as charactersRoute };
