import express from "express";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Gets the filename and directory name of the current module.
 *
 * @constant
 * @type {string}
 */
const __filename: string = fileURLToPath(import.meta.url);

/**
 * Gets the directory name of the current module.
 *
 * @constant
 * @type {string}
 */
const __dirname: string = path.dirname(__filename);

/**
 * Path to the public directory.
 *
 * @constant
 * @type {string}
 */
const publicPath: string = path.join(__dirname, "..", "public");

/**
 * Joins the public path with the specified file name.
 *
 * @param {string} file - The file name to be joined with the public path.
 * @returns {string} - The full path to the specified file.
 */
const pathFile = (file: string): string => path.join(publicPath, file);

const app = express();

/**
 * Middleware to filter requests for static files.
 *
 * Allows access to specific paths and denies access to others.
 *
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
const staticFileFilter = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const allowedPaths = ["/css", "/assets", "/scripts", "/trips"];
  const requestPath = req.path;

  const isAllowed = allowedPaths.some((allowedPath) =>
    requestPath.startsWith(allowedPath)
  );

  if (isAllowed) return next();

  res.status(403).send("Access to this resource is forbidden.");
};

/**
 * Use the custom middleware
 */
app.use(staticFileFilter);

/**
 * Serves static files from the public directory.
 */
app.use(express.static(publicPath));

export const port = 3000;
export const hostname = "localhost";

export default app;
