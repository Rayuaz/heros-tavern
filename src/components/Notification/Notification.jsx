import React, { useEffect, useState } from "react";

export default function Notification({ content, duration }) {
    const [isClosing, setClosing] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setClosing(true);
        }, duration - 600); // 300ms is the slide animation duration
    }, []);

    return (
        <div id="notification" className={isClosing ? "closing" : ""}>
            <p>{content}</p>
        </div>
    );
}
