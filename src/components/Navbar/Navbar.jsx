import React from "react";
import { useLocation } from "react-router-dom";

import Logo from "./Logo/logo";
import Button from "@/components/Button/Button";

import { ChevronIcon } from "@/assets/icons/ChevronIcon";

export default function Navbar({ children }) {
    const { pathname } = useLocation();

    return (
        <nav>
            <div className="logo-wrapper">
                <Button
                    icon={ChevronIcon}
                    type="small icon back"
                    link="/"
                    disabled={pathname === "/"}
                    aria="Go back"
                />
                <Logo />
            </div>
            <div className="buttons">{children}</div>
        </nav>
    );
}
