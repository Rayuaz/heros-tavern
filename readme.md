# Hero's Tavern

Hero's Tavern is a web app for RPG character inspiration. In the main page, the user can navigate through thousands of character prompts, and filter the results by race and class. They can also go to the details page to read that character's connections, ideals, appearance and background. In this page, they can also chat with the character using GPT 3.5.

## Development

### Database

This app requires [PocketBase](https://pocketbase.io/) as its database. You can install it wherever you want. After installing, set the data schema by opening the pocketbase admin UI and going to Settings > import collections. You can find the schema for this project in `pocketbase/pb_schema.json`. This folder also has some sample data. To use it, replace the `data.db` file in your PocketBase install directory with the `data.db` file in the `pocketbase` directory in this repository.

#### Populating the database

To populate the database, you can use the [Hero's Tavern Populator](https://github.com/Rayuaz/heros-tavern-populator). This tool uses Open AI's API to generate new characters and add them to the database. It also has a script to rename characters, since GPT 3.5 has a tendency to use copyrighted character names.

### Running the application

1. Navigate to your PocketBase intall directory and run:

```
./pocketbase serve
```

2. Navigate to the project folder and start the API:

```
npm run server
```

3. Start the development server with:

```
npm run dev
```

#### Production

When you are ready for production, run:

```
npm run build
```

In the production environment, you will still need to start PocketBase and the API, following steps 1 and 2.

### Environment variables

-   `OPEN_API_KEY`: Your Open API key. This will be used to generate the character background, and to run the chat.
-   `APP_URL`: The URL where the app is running. Used by the API for setting up CORS.
-   `VITE_APP_DOMAIN`: The public domain of the website hosting the app. It's used for the HTML meta tags.
-   `API_PORT`: The port where the API will run.
-   `VITE_API_URL`: The API URL. Used by the app to make requests to the API.
-   `POCKETBASE_URL`: Used by the API to operate the database.
-   `POCKETBASE_EMAIL`: The API's PocketBase user email. Used by the API to get authorization to operate the database.
-   `POCKETBASE_PASSWORD`: The API's PocketBase user password. Used by the API to get authorization to operate the database.
