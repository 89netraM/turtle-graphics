/**
 * @file A utility for copying the lambda glue files into the SvelteKit build directory.
 */

import { cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
cpSync(join(__dirname, "lambda"), join(__dirname, "build"), { recursive: true });
