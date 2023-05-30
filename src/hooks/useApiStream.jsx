import { useState, useEffect } from "react";

export default async function fetchBackground(url) {
    const [response, setResponse] = useState("");
    const [error, setError] = useState("");
    const [isStreaming, setStreaming] = useState(true);

    await new Promise((r) => setTimeout(r, 300));

    const sse = new EventSource({ url });

    sse.onmessage = (e) => {
        if (e.data != "[DONE]") {
            const payload = JSON.parse(e.data);
            const text = payload.choices[0].delta.content;

            if (text != undefined) {
                setResponse((prevState) => {
                    return prevState + text;
                });
            }
        } else {
            sse.close();
            setStreaming(false);
        }
    };
    sse.onerror = () => {
        sse.close();
        setStreaming(false);
    };

    return [response, error, isStreaming];
}
