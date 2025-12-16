import serverlessExpress from "@codegenie/serverless-express";
import polka from "polka";

import { handler as svelteHandler } from "./handler.js";

const app = polka().use(svelteHandler);

export default serverlessExpress({ app });
