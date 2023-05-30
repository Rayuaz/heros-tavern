const commonRaces = [
    "Dwarf",
    "Elf",
    "Gnome",
    "Halfling",
    "Human",
    "Goblin",
    "Kenku",
    "Kobold",
    "Hobgoblin",
    "Lizardfolk",
    "Orc",
    "Catfolk",
    "Warforged",
];

const dndRaces = [
    "Aarakocra",
    "Tortle",
    "Aasimar",
    "Firbolg",
    "Genasi",
    "Bugbear",
    "Fairy",
    "Satyr",
    "Half-elf",
    "Half-orc",
    "Tiefling",
    "Goliath",
    "Dragonborn",
];

const pathfinderRaces = [
    "Azarketi",
    "Leshy",
    "Fetchling",
    "Gnoll",
    "Grippli",
    "Kitsune",
    "Nagaji",
    "Ratfolk",
    "Vanara",
];

const commonClasses = [
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Wizard",
    "Artificer",
];

const pathfinderclasses = [
    "Alchemist",
    "Investigator",
    "Magus",
    "Oracle",
    "Psychic",
    "Summoner",
    "Swashbuckler",
    "Thaumaturge",
    "Gunslinger",
];

const professions = [
    "Merchant",
    "Blacksmith",
    "Bowyer",
    "Herbalist",
    "Jester",
    "Innkeeper",
    "Carpenter",
    "Lumberjack",
    "Mason",
    "Leatherworker",
    "Tailor",
    "Miller",
    "Baker",
    "Cook",
    "Jeweler",
    "Librarian",
    "Astrologer",
    "Cartographer",
    "Sailor",
    "Fisherman",
    "Farmer",
    "Beekeeper",
    "Miner",
    "Mayor",
    "Noble",
    "Historian",
    "Butcher",
    "Guild Master",
    "Priest",
    "Banker",
    "Archaeologist",
    "Crime Boss",
];

export const allClasses = [...commonClasses, ...pathfinderclasses, ...professions];
export const allRaces = [...commonRaces, ...dndRaces, ...pathfinderRaces];

export const racesRegex = new RegExp(`${allRaces.join("|")}|dwarven|elven`, "i");
export const classesRegex = new RegExp(allClasses.join("|"), "i");
export const filterOptions = {
    classes: [
        {
            title: "Common Classes",
            options: commonClasses,
        },
        {
            title: "Pathfinder Classes",
            options: pathfinderclasses,
        },
        {
            title: "Generic Professions",
            options: professions,
        },
    ],
    races: [
        {
            title: "Common Races",
            options: commonRaces,
        },
        {
            title: "DnD Races",
            options: dndRaces,
        },
        {
            title: "Pathfinder Races",
            options: pathfinderRaces,
        },
    ],
};

export const greetings = [
    "Meet",
    "Behold",
    "Say hi to",
    "Welcome",
    "Greet",
    "You approach",
    "You see",
    "You sit next to",
    "How about",
];
