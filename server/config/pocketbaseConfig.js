import PocketBase from "pocketbase";
import dotenv from "dotenv";

/* --- PocketBase authentication --- */

const pb = new PocketBase(dotenv.config().parsed.POCKETBASE_URL);
pb.autoCancellation(false);
await pb
    .collection("users")
    .authWithPassword(dotenv.config().parsed.POCKETBASE_EMAIL, dotenv.config().parsed.POCKETBASE_PASWORD);

export default pb;
