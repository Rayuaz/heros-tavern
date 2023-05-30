import React from "react";
import { Link } from "react-router-dom";

export default function Button({ icon, label, type, onClick, link, disabled, submit, aria }) {
    const externalLink = link && link.match(/^https/);

    return link === undefined ? (
        <button
            className={`button ${type ? type : ""}`}
            onClick={onClick}
            disabled={disabled}
            type={submit ? "submit" : "button"}
            aria-label={aria}
            title={label ? "" : aria}
        >
            {icon}
            {label && <span className="label">{label}</span>}
        </button>
    ) : (
        <Link
            to={link}
            target={externalLink && "_blank"}
            className={`button ${type ? type : ""} ${disabled ? "disabled" : ""}`}
            onClick={onClick}
            aria-label={aria}
            title={label ? "" : aria}
            aria-disabled={disabled}
            aria-hidden={disabled}
            tabIndex={disabled ? "-1" : ""}
        >
            {icon}
            {label && <span className="label">{label}</span>}
        </Link>
    );
}
