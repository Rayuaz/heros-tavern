import { useState, useEffect, useContext } from "react";

import Button from "@/components/Button/Button";

import { ModalContext } from "@/components/Modal/Modal";
import { AppearanceContext } from "@/App";

import { FilterIcon } from "@/assets/icons/FilterIcon";
import { ChevronIcon } from "@/assets/icons/ChevronIcon";
import { ShortcutIcon } from "@/assets/icons/ShortcutIcon";
import { AppearanceIcon } from "@/assets/icons/AppearanceIcon";
import { DarkThemeIcon } from "@/assets/icons/DarkThemeIcon";
import { LightThemeIcon } from "@/assets/icons/LightThemeIcon";

// --- LOGIC ---

export default function OptionsForm({ onSubmit, options, originalState }) {
    // -- State

    // Form data state
    const [form, setForm] = useState({ classes: [], races: [] });

    // These two states controls wheter to show or hide the classes / races sections
    const [showClasses, setShowClasses] = useState(true);
    const [showRaces, setShowRaces] = useState(true);

    // Close function from the modal context
    const { close } = useContext(ModalContext);

    // App color theme context
    const appearanceContext = useContext(AppearanceContext);

    // On mount, gets the current classes/races filters and applies them to the form state
    useEffect(() => {
        const classes = registerInputs(options.classes, "classes", originalState);
        const races = registerInputs(options.races, "races", originalState);

        setForm({ classes, races });
    }, []);

    // -- Functions

    // Updates the form state when checking one of the class/race options
    function handleChange(e, category) {
        const name = e.target.name;
        const index = form[category].findIndex((obj) => obj.name === name);

        setForm((prevState) => {
            const newState = {
                ...prevState,
                [category]: [
                    ...prevState[category].slice(0, index),
                    {
                        ...prevState[category][index],
                        value: !prevState[category][index].value,
                    },
                    ...prevState[category].slice(index + 1),
                ],
            };

            return newState;
        });
    }

    // Submits the form, passing the data to the parent component, which will save these changes
    // to the character fetch filter, and save them to the local storage
    function submitForm(e) {
        e.preventDefault();

        const classes = form.classes.filter((item) => item.value === true).map((item) => item.name);
        const races = form.races.filter((item) => item.value === true).map((item) => item.name);
        const newFilters = { classes, races };

        onSubmit(newFilters);
        close();
    }

    // Toggle all the options in a section between true and false
    function toggleCategory(sections) {
        toggleSection("classes", sections);
        toggleSection("races", sections);
    }
    function toggleSection(category, sections) {
        let newState;

        if (form[category].some((item) => sections.includes(item.section) && item.value === false)) {
            newState = form[category].map((option) => {
                if (sections.includes(option.section)) {
                    return {
                        ...option,
                        value: true,
                    };
                }
                return option;
            });
        } else {
            newState = form[category].map((option) => {
                if (sections.includes(option.section)) {
                    return {
                        ...option,
                        value: false,
                    };
                }
                return option;
            });
        }

        setForm((prevState) => {
            return {
                ...prevState,
                [category]: newState,
            };
        });
    }

    // --- RETURN ---

    return (
        <form id="options-form" onSubmit={(e) => submitForm(e)}>
            <div className="form-blocks">
                <div className="form-block" id="appearance">
                    <div className="category-header">
                        {AppearanceIcon}
                        <h2>Appearance</h2>
                    </div>
                    <div className="options">
                        <Button
                            label="Dark"
                            type={`${appearanceContext.appearance === "dark" ? "primary" : "secondary"} small`}
                            icon={DarkThemeIcon}
                            onClick={() => appearanceContext.handleSetAppearance("dark")}
                        />
                        <Button
                            label="Light"
                            type={`${appearanceContext.appearance === "light" ? "primary" : "secondary"} small`}
                            icon={LightThemeIcon}
                            onClick={() => appearanceContext.handleSetAppearance("light")}
                        />
                    </div>
                </div>

                <div className="form-block" id="quick-actions">
                    <div className="category-header">
                        {ShortcutIcon}
                        <h2>Quick Filters</h2>
                    </div>
                    <div className="options">
                        <Button
                            label="Toggle Pathfinder Content"
                            type="secondary small"
                            onClick={() => toggleCategory(["Pathfinder Classes", "Pathfinder Races"])}
                        />
                        <Button
                            label="Toggle DnD Content"
                            type="secondary small"
                            onClick={() => toggleCategory(["DnD Races"])}
                        />
                        <Button
                            label="Toggle everything"
                            type="secondary small"
                            onClick={() =>
                                toggleCategory([
                                    "DnD Races",
                                    "DnD Classes",
                                    "Pathfinder Classes",
                                    "Pathfinder Races",
                                    "Common Classes",
                                    "Common Races",
                                    "Generic Professions",
                                ])
                            }
                        />
                    </div>
                </div>

                <div className="form-block" id="class-filters">
                    <button
                        className="category-header"
                        onClick={() => setShowClasses((prevState) => !prevState)}
                        aria-expanded={showClasses.toString()}
                        aria-controls="classSection"
                        id="class-control"
                        type="button"
                    >
                        {FilterIcon}
                        <h2>Classes</h2>
                        {ChevronIcon}
                    </button>
                    <div id="class-options" aria-labelledby="class-control" hidden={!showClasses}>
                        {renderOptions(options.classes, "classes", form, handleChange, toggleSection)}
                    </div>
                </div>

                <div className="form-block" id="race-filters">
                    <button
                        className="category-header"
                        onClick={() => setShowRaces((prevState) => !prevState)}
                        aria-expanded={showRaces.toString()}
                        aria-controls="raceSection"
                        id="race-control"
                        type="button"
                    >
                        {FilterIcon}
                        <h2>Races</h2>
                        {ChevronIcon}
                    </button>
                    <div id="race-options" aria-labelledby="race-control" hidden={!showRaces}>
                        {renderOptions(options.races, "races", form, handleChange, toggleSection)}
                    </div>
                </div>
            </div>

            <div className="submit-wrapper">
                <Button label="Save options" type="primary big" submit={true} />
            </div>
        </form>
    );
}

// --- FUNCTIONS ---

function registerInputs(categoryArray, categoryTitle, originalState) {
    return categoryArray.reduce((sectionAccumulator, section) => {
        const options = section.options.map((option) => {
            return {
                name: option,
                value:
                    originalState[categoryTitle].length === 0 || originalState[categoryTitle].includes(option)
                        ? true
                        : false,
                section: section.title,
            };
        });
        return [...sectionAccumulator, ...options];
    }, []);
}

function renderOptions(category, categoryKey, form, handleChange, toggleFunction) {
    return (
        <>
            {category.map((section, sectionIndex) => {
                return (
                    <fieldset key={sectionIndex}>
                        <div className="section-header">
                            <legend>
                                <Button
                                    label={section.title}
                                    onClick={() => toggleFunction(categoryKey, [section.title])}
                                    aria-describedby={`${section.title}-label`}
                                />
                            </legend>
                            <p className="button-label" id={`${section.title}-label`}>
                                Toggle all
                            </p>
                        </div>
                        <div className="options checkboxes">
                            {section.options.map((option, optionIndex) => {
                                const optionData = form[categoryKey].find((i) => i.name === option);

                                const isChecked = optionData ? optionData.value : true;

                                return (
                                    <label htmlFor={option} className="option" key={optionIndex}>
                                        <input
                                            type="checkbox"
                                            name={option}
                                            id={option}
                                            checked={isChecked}
                                            onChange={(e) => handleChange(e, categoryKey)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                );
            })}
        </>
    );
}
