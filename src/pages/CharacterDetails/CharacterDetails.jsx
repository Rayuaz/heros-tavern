import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Chat from "./Chat/Chat";
import Notification from "@/components/Notification/Notification";
import Loader from "../../components/Loader/Loader";

import axios from "@/config/axiosConfig.js";
import useAxios from "@/hooks/useAxios";

import { ShareIcon } from "@/assets/icons/ShareIcon";
import { ExportIcon } from "@/assets/icons/ExportIcon";
import { MindIcon } from "@/assets/icons/MindIcon";
import { MirrorIcon } from "@/assets/icons/MirrorIcon";
import { ConnectionIcon } from "@/assets/icons/ConnectionIcon";
import { BackgroundIcon } from "@/assets/icons/BackgroundIcon";
import { SpeechIcon } from "@/assets/icons/SpeechIcon";
import { ChatIcon } from "@/assets/icons/ChatIcon";

// --- LOGIC ---

export default function CharacterDetails() {
    // --- State

    // Fetches the character
    const characterId = useParams().id;
    const [character, error, loading] = useAxios({
        axiosInstance: axios,
        method: "GET",
        url: `characters/${characterId}`,
    });

    // Checks if the fetch was sucessful
    const successfulFetch = !loading && !error && character && true;

    // Page content
    const characterName = successfulFetch && character.prompt.match(/^[^,]+(?=,)/);
    const characteristics = successfulFetch && splitText(character.characteristics);
    const connections = successfulFetch && splitText(character.connections);

    // Character background
    const [characterBackground, setCharacterBackground] = useState("");
    const [isStreamingBackground, setStreamingBackground] = useState(false);

    // Sets the character background (if they have it) once the character fetch is complete
    useEffect(() => {
        if (character.background) {
            setCharacterBackground(character.background.replace(/\\n/g, "\n"));
        }
    }, [character]);

    // Modal logic
    const modalRef = useRef();
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        if (showModal === true) {
            modalRef.current.showModal();
        } else {
            if (modalRef.current) {
                modalRef.current.close();
            }
        }
    }, [showModal]);

    // Notification configuration
    const [notification, setNotification] = useState("");
    const notificationDuration = 2000;

    // --- Functions

    // Formats the character text, splitting it into substrings for each new line
    function splitText(text) {
        if (text.match(/(\n\n)|(\r\n\r\n)/)) {
            return text.split(/(?:\n\n)|(?:\r\n\r\n)/);
        } else {
            return text.split(/\r*\n/);
        }
    }

    // Fetches the character background. The character background endpoint is a stream. Once the stream finishes, the server
    // will save it to the database.
    async function fetchBackground() {
        setStreamingBackground(true);

        // Turn off aria live while streaming the background, because
        // otherwise the screen reader would try to read the background again
        // everytime a new chunk is loaded. Once the stream has finished, the aria live
        // is set turned back on
        document.getElementById("root").ariaLive = "off";

        await new Promise((r) => setTimeout(r, 300));

        const sse = new EventSource(`${import.meta.env.VITE_API_URL}/characters/${character.id}/background`);

        sse.onmessage = (e) => {
            if (e.data != "[DONE]") {
                const payload = JSON.parse(e.data);
                const text = payload.choices[0].delta.content;

                if (text != undefined) {
                    setCharacterBackground((prevState) => {
                        return prevState + text;
                    });
                }
            } else {
                sse.close();
                setStreamingBackground(false);
                document.getElementById("root").ariaLive = "polite";
            }
        };
        sse.onerror = () => {
            sse.close();
            setStreamingBackground(false);
            document.getElementById("root").ariaLive = "polite";
        };
    }

    // Shares the page using the Web Share API. If not possible, writes the link to the clipboard, and if that's not possible either,
    // send a notification to the user telling them they the browser doesn't allow copying content to the clipboard
    function sharePage() {
        if (navigator.share) {
            navigator.share({
                title: `Meet ${character?.name} at the Hero's Tavern`,
                text: `Check out this cool character I met at the Hero's Tavern: "${character?.prompt}"`,
                url: `/?c=${character?.id}`,
            });
        } else {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(`${window.location.hostname}/?c=${character?.id}`);
                setNotification("The character's link has been copied to the clipboard");
            } else {
                setNotification("Your browser doesn't allow content sharing");
            }

            setTimeout(() => {
                setNotification("");
            }, notificationDuration);
        }
    }

    // Error handling for the character fetch function
    function handleFetchError() {
        if (error.response) {
            switch (error.response.status) {
                case 429:
                    return "You are making too many requests. Slow down!";
                    break;
                case 404:
                    return "There's no one here. Try going to the next table.";
                    break;
                default:
                    return "An unexpected error happened at the server. Try again later.";
                    break;
            }
        } else if (error.request) {
            console.log(error);
            return "Could not connect to the server. Try again later.";
        } else {
            return "An unexpected error happened. Try again later.";
        }
    }

    // --- RETURN ---

    return (
        <>
            {notification && <Notification content={notification} duration={notificationDuration} />}

            <Navbar>
                <Button icon={ShareIcon} label="Share" type="secondary small" onClick={sharePage} />
                <Button icon={ExportIcon} label="Export" type="secondary small" onClick={() => window.print()} />
            </Navbar>

            <div className="content" id="characterDetails">
                {/* Error / Loading state */}
                {loading && (
                    <div className="state-container">
                        <Loader />
                    </div>
                )}
                {!loading && error && (
                    <div className="state-container">
                        <p className="errMsg">{handleFetchError(error)}</p>
                    </div>
                )}
                {!loading && !error && !character && <p className="errMsg">This table is empty</p>}

                {/* Successful fetch state */}
                {successfulFetch && (
                    <>
                        <header>
                            <h1>{characterName}</h1>
                            <p>{character.prompt}</p>
                        </header>

                        <main>
                            <section id="background">
                                <h2>{BackgroundIcon} Background</h2>
                                {!characterBackground && (
                                    <Button
                                        label="Show background"
                                        type={`primary big ${isStreamingBackground && "hiding"}`}
                                        icon={SpeechIcon}
                                        onClick={fetchBackground}
                                    />
                                )}

                                {/* This element lets screen reader users know when the background is being streamed. It 
                                is rendered only to the screen reader while the background is being streamed */}
                                <p role="status" aria-live="assertive" className="screen-reader-only">
                                    {isStreamingBackground && "Generating background. This may take a few seconds"}
                                </p>

                                {!characterBackground && isStreamingBackground && (
                                    <div className="state-container">
                                        <Loader />
                                    </div>
                                )}
                                {characterBackground && isStreamingBackground && (
                                    <p className="background-text">{renderStreamedText(characterBackground, 20)}</p>
                                )}
                                {characterBackground && !isStreamingBackground && (
                                    <p className="background-text">{characterBackground}</p>
                                )}
                            </section>

                            <div>
                                <section>
                                    <h2>{MirrorIcon} Appearance</h2>
                                    <p>{character.appearance}</p>
                                </section>
                                <section>
                                    <h2>{MindIcon} Characteristics</h2>
                                    <ul>
                                        {characteristics.map((item, index) => {
                                            return <li key={index}>{highlightText(item, `.+(?=:)`)}</li>;
                                        })}
                                    </ul>
                                </section>
                                <section>
                                    <h2>{ConnectionIcon} Connections</h2>
                                    <ul>
                                        {connections.map((item, index) => {
                                            return <li key={index}>{highlightText(item, `\\*(?:.*?)\\*`)}</li>;
                                        })}
                                    </ul>
                                </section>
                            </div>
                        </main>

                        <Footer />

                        <div id="chat">
                            <Button
                                type="primary big chat-button"
                                label="Chat"
                                icon={ChatIcon}
                                onClick={() => setShowModal(true)}
                            />
                            <Modal
                                type="drawer"
                                title="Chat"
                                icon={ChatIcon}
                                ref={modalRef}
                                closeModal={() => {
                                    setShowModal(false);
                                }}
                            >
                                <Chat character={character} characterBackground={characterBackground} />
                            </Modal>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// --- FUNCTIONS ---

// Highlights the last words while the background is being streamed
function renderStreamedText(text, length) {
    if (text.length <= length) {
        return <span className="streaming">{text}</span>;
    } else {
        return (
            <>
                {text.slice(0, -length)}
                <span className="streaming">{text.slice(-length)}</span>
            </>
        );
    }
}

// Highlights the specified regex from from the specified text
function highlightText(text, higlight) {
    const chunks = text.split(new RegExp(`(${higlight})`, "g"));
    const matchingChunks = text.match(new RegExp(`(${higlight})`, "g"));

    if (matchingChunks) {
        return chunks.map((part, index) => (
            <React.Fragment key={index}>
                {matchingChunks.includes(part) ? <strong>{part.replace(/\*/g, "")}</strong> : part}
            </React.Fragment>
        ));
    } else {
        return chunks.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);
    }
}
