import { createContext, useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import CharacterDetails from "./pages/CharacterDetails/CharacterDetails";

export const AppearanceContext = createContext();

function App() {
    const [appearance, setAppearance] = useState("light");

    function handleSetAppearance(newAppearance) {
        setAppearance(newAppearance);
        localStorage.setItem("appearance", newAppearance);
    }

    useEffect(() => {
        setAppearance(localStorage.getItem("appearance") || "light");
    }, []);

    useEffect(() => {
        document.body.setAttribute("appearance", appearance);
    }, [appearance]);

    return (
        <AppearanceContext.Provider value={{ appearance, handleSetAppearance }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/character/:id" element={<CharacterDetails />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AppearanceContext.Provider>
    );
}

export default App;
