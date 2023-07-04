import React, { useEffect, useRef, useState } from "react";

import Button from "@/components/Button/Button";

import axios from "@/config/axiosConfig.js";
import getRandom from "@/utils/getRandom";
import { chatSuggestions } from "./chatSuggestions";

import { SendIcon } from "@/assets/icons/SendIcon";
import { SpeechIcon } from "@/assets/icons/SpeechIcon";

// --- LOGIC ---

export default function Chat({ character, characterBackground }) {
    // --- State

    // The placeholder text for the textarea
    const chatInputPlaceholder = useRef(getRandom(chatSuggestions));

    // The chat messages
    const [messages, setMessages] = useState([]);

    // The message context that will be sent to the Open AI API
    // It includes user and assistant messages, excluding system messages
    const messageContext = useRef([]);

    // The max number of messages to be sent to the Open AI API
    const maxContextSize = 10;

    // Element refs
    const formRef = useRef();
    const textAreaRef = useRef();
    const listEndRef = useRef();

    // The content of the text area
    const [userMessage, setUserMessage] = useState("");

    // The data fetch loading state
    const [loading, setLoading] = useState(false);

    // Scroll to the bottom everytime a new message is sent
    useEffect(() => {
        listEndRef.current.scrollIntoView();
    }, [messages]);

    // --- Functions

    // Message submition logic
    async function submitMessage(e) {
        e.preventDefault();

        // If the user is not on mobile, return focus to the text area
        if (window.innerWidth >= 1024) {
            textAreaRef.current.focus();
        }

        const newMessage = {
            role: "user",
            content: userMessage,
        };
        // Resets the text area
        setUserMessage("");
        // Gets a new question suggestion for the textarea placeholder
        chatInputPlaceholder.current = getRandom(chatSuggestions);

        // Adds the message to the message list
        setMessages((prevState) => {
            return [...prevState, newMessage];
        });
        // Adds the message to the API message context
        addMessageToContext(newMessage);

        setLoading(true);
        const controller = new AbortController();

        try {
            const res = await axios.post(
                "/chat",
                {
                    character: { ...character, background: characterBackground },
                    messages: messageContext.current,
                },
                { signal: controller.signal }
            );

            const responseMessage = {
                role: "assistant",
                content: res.data.choices[0].message.content,
            };

            setMessages((prevState) => {
                return [...prevState, responseMessage];
            });
            addMessageToContext(responseMessage);
        } catch (error) {
            console.log(error);

            if (error.response) {
                if (error.response.status === 429) {
                    setMessages((prevState) => {
                        return [
                            ...prevState,
                            {
                                role: "system",
                                title: "Too many requests",
                                content: "You are sending messages too quickly. Try again in one minute.",
                            },
                        ];
                    });
                } else {
                    setMessages((prevState) => {
                        return [
                            ...prevState,
                            {
                                role: "system",
                                title: "Unexpected error",
                                content:
                                    "An unexpected error happened at the server. Try sending your message again, and if that doesn't work, try refreshing the page.",
                            },
                        ];
                    });
                }
            } else if (error.request) {
                setMessages((prevState) => {
                    return [
                        ...prevState,
                        {
                            role: "system",
                            title: "Connection failed",
                            content: "Could not connect to the server. Try again later.",
                        },
                    ];
                });
            } else {
                setMessages((prevState) => {
                    return [
                        ...prevState,
                        {
                            role: "system",
                            title: "Unexpected error",
                            content:
                                "An unexpected error happened. Try sending your message again, and if that doesn't work, try refreshing the page.",
                        },
                    ];
                });
            }
        } finally {
            setLoading(false);
        }
    }

    // Adds messages to the API Context, and removes the older message if
    // it would exceed the message context limit
    function addMessageToContext(message) {
        if (messageContext.current.length === maxContextSize) {
            messageContext.current.shift();
        }

        messageContext.current.push({ ...message });
    }

    // Auto resize the text area
    function handleTextAreaChange(e) {
        setUserMessage(e.target.value);

        if (e.target.scrollHeight < 400) {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
            e.target.style.overflow = "hidden";
        } else {
            e.target.style.overflow = "auto";
        }
    }

    // Send the message on hitting enter
    function sendMessageOnEnter(e) {
        if (!loading) {
            if (e.keyCode == 13 && e.shiftKey == false) {
                e.preventDefault();
                formRef.current.requestSubmit();
            }
        } else {
            if (e.keyCode == 13 && e.shiftKey == false) {
                e.preventDefault();
            }
        }
    }

    // --- RETURN ---

    return (
        <>
            <ul className="messages">
                <li className="message system cta">
                    <div className="message-header">
                        <p>Keep the tavern doors open</p>
                    </div>
                    <p className="content">
                        Greetings adventurer! This app uses the Open AI API, which costs me some money for each message
                        you send. Before you chat with Grimgor Thornblood, please consider supporting me by donating if
                        you are able. A single dollar goes a long way in keeping the service online. Thank you!
                    </p>
                    <p className="disclaimer">
                        <strong>P.S.</strong> Open AI does not use your data for improving their models. You can{" "}
                        <a href="https://openai.com/policies/api-data-usage-policies">
                            {" "}
                            check their privacy policy over here
                        </a>
                        .
                    </p>
                    <Button label="Donate" type="primary small" link="https://ko-fi.com/Rayuaz" />
                </li>

                {messages.map((message, index) => {
                    return (
                        <li key={index} className={`message ${message.role}`}>
                            {message.title && (
                                <div className="message-header">
                                    <p>{message.title}</p>
                                </div>
                            )}
                            {message.role === "user" && SpeechIcon}
                            <p className="content">{message.content}</p>
                        </li>
                    );
                })}

                {/* This element is used as an anchor to scroll to the bottom of the page */}
                <div className="listEndRef" ref={listEndRef}></div>
            </ul>

            {loading && <p className="thinking">{`${character.name} is thinking...`}</p>}

            <form className="text-area-container" onSubmit={(e) => submitMessage(e)} ref={formRef}>
                <textarea
                    name="chat-input"
                    id="chat-input"
                    placeholder={`Try asking "${chatInputPlaceholder.current}"`}
                    value={userMessage}
                    onChange={(e) => handleTextAreaChange(e)}
                    onKeyDown={(e) => sendMessageOnEnter(e)}
                    ref={textAreaRef}
                ></textarea>
                <div className="controls">
                    <Button
                        label="Send"
                        type="secondary small"
                        icon={SendIcon}
                        submit={"submit"}
                        disabled={!userMessage.length || loading ? true : false}
                    />
                </div>
            </form>
        </>
    );
}
