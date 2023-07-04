import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import Modal from "@/components/Modal/Modal";
import OptionsForm from "./OptionsForm/OptionsForm";
import Notification from "@/components/Notification/Notification";

import getRandom from "@/utils/getRandom";
import axios from "@/config/axiosConfig.js";
import useAxios from "@/hooks/useAxios";
import { greetings, classesRegex, racesRegex, filterOptions } from "./variables";

import { OptionsIcon } from "@/assets/icons/OptionsIcon";
import { ShareIcon } from "@/assets/icons/ShareIcon";

// --- LOGIC ---

export default function Home() {
    // -- State

    // This is the text that appears on top of the character prompt. It gets randomized everytime there's a new character
    const [greeting, setGreeting] = useState("Meet");

    // Gets the character from the URL
    const [searchParams] = useSearchParams({});
    const characterId = searchParams.get("c");

    // Character fetching logic

    // Reference to know when it's the first render
    const onMount = useRef(true);
    // If there's a character from the URL, set the fetch URL to get that character's data. Otherwise, set the URL to get a random character
    const url = onMount.current && characterId ? `/characters/${characterId}` : "/characters/random";
    // Get the filters from local storage. If there's nothing in local storage, leave the filters empty
    const [filters, setFilters] = useState({
        classes: JSON.parse(localStorage.getItem("classes")) || [],
        races: JSON.parse(localStorage.getItem("races")) || [],
    });
    // Fetch the character data from the API
    const [character, error, loading, refetch] = useAxios({
        axiosInstance: axios,
        method: "GET",
        url,
        requestConfig: {
            headers: {
                "Content-Language": "en-US",
            },
            params: filters,
        },
    });

    // Change the greeting text when character changes
    useEffect(() => {
        setGreeting(getRandom(greetings));
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

    // -- Functions

    // Gets a new character
    function fetchNewCharacter() {
        onMount.current = false;
        refetch();
    }

    // Highlights the character's name, race and class
    function highlightCharacterPrompt(text) {
        if (!text) {
            return;
        }

        const name = text.match(/^[^,]+(?=,)/); // The character's name should always be whatever comes before the first comma
        const race = text.match(racesRegex);
        const charClass = text.match(classesRegex);
        const textHighlightRegex = new RegExp(
            `(${name && name[0]}${race && "|" + race[0]}${charClass && "|" + charClass[0]})`
        );

        const chunks = text.split(textHighlightRegex);

        const filteredChunks = chunks.filter((i) => i);

        let partsMatched = 0;
        const newString = filteredChunks.map((part, index) => {
            if (part.match(textHighlightRegex) && partsMatched < 3) {
                partsMatched++;
                return <strong key={index}>{part}</strong>;
            } else {
                return <span key={index}>{part}</span>;
            }
        });

        return newString;
    }

    // This function gets passed to the options modal form. It changes the filters state, and saves the changes to local storage
    function handleForm(data) {
        setFilters(data);
        localStorage.setItem("classes", JSON.stringify(data.classes));
        localStorage.setItem("races", JSON.stringify(data.races));
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
                <Button icon={OptionsIcon} label="Options" type="secondary small" onClick={() => setShowModal(true)} />
            </Navbar>

            <main id="characterPrompt">
                {/* Greeting / Error / Loader label */}
                {loading && <p className="greeting loading">Going to the next table</p>}
                {!loading && error && <p className="greeting">Error</p>}
                {!loading && !error && !character && <p className="greeting">Error</p>}
                {!loading && !error && character && <p className="greeting">{greeting}</p>}

                {/* Loader / Error message */}
                {loading && <Loader className="loading" />}
                {!loading && error && <p className="errMsg">{handleFetchError()}</p>}
                {!loading && !error && !character && (
                    <p className="errMsg">There's no one here. Try going to the next table.</p>
                )}

                {/* Character Prompt */}
                {!loading && !error && character && (
                    <p className="prompt">{highlightCharacterPrompt(character.prompt)}</p>
                )}
            </main>

            <div id="footerSection">
                <section id="controls">
                    <Button
                        label="Go to the next table"
                        type="primary big"
                        onClick={fetchNewCharacter}
                        disabled={loading}
                    />
                    <Button
                        label="Learn More"
                        type="secondary big"
                        link={`/character/${character.id}`}
                        disabled={loading}
                    />
                </section>

                <Footer />
            </div>

            {showModal && (
                <Modal
                    icon={OptionsIcon}
                    title="Options"
                    type="drawer"
                    closeModal={() => {
                        setShowModal(false);
                    }}
                    ref={modalRef}
                >
                    <OptionsForm onSubmit={handleForm} options={filterOptions} originalState={filters} />
                </Modal>
            )}
        </>
    );
}
