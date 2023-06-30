# Hero's Tavern

Hero's Tavern is a web app for RPG character inspiration. In the main page, the user can navigate through thousands of character prompts, and filter the results by race and class. They can also go to the details page to read that character's connections, ideals, appearance and background. In this page, they can also chat with the character using GPT 3.5.

## Development

### Database

This repository contains only the frontend application. To function correctly, it requires a PocketBase database to store the character data. The database configuration info, as well as the tools to populate it are available in the [Hero's Tavern Utilities](https://github.com/Rayuaz/heros-tavern-utilities) repository.

### Running the application

1. Navigate to the database folder and start the database:

```
./pocketbase serve
```

2. Navigate to the root folder and start the API Gateway:

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

In the production environment, you will still need to run the database and the API Gateway, following steps 1 and 2.

### Environment variables

-   `OPEN_API_KEY`: Your Open API key. This will be used to generate the character background, and to run the chat.
-   `APP_URL`: The URL where the app is running. Used by the API gateway for setting up CORS.
-   `VITE_API_URL`: The API gateway URL. Used by the app to make requests to the gateway.
-   `POCKETBASE_URL`: Used by the gateway to operate the database.
-   `POCKETBASE_EMAIL`: The gateway PocketBase user email. Used by the gateway to get authorization to operate the database.
-   `POCKETBASE_URL`: The gateway PocketBase user password. Used by the gateway to get authorization to operate the database.
