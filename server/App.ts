import express from "express";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Obtiene el nombre del archivo actual en el módulo ES.
 *
 * @constant
 * @type {string}
 */
const __filename: string = fileURLToPath(import.meta.url);

/**
 * Obtiene el directorio del archivo actual en el módulo ES.
 *
 * @constant
 * @type {string}
 */
const __dirname: string = path.dirname(__filename);

/**
 * Ruta al directorio público del servidor.
 *
 * @constant
 * @type {string}
 */
const publicPath: string = path.join(__dirname, "..", "public");

const app: express.Express = express();

/**
 * Middleware para filtrar solicitudes de archivos estáticos.
 *
 * Permite el acceso solo a rutas específicas y bloquea otras.
 *
 * @param {express.Request} req - Objeto de solicitud HTTP.
 * @param {express.Response} res - Objeto de respuesta HTTP.
 * @param {express.NextFunction} next - Función para pasar al siguiente middleware.
 */
const staticFileFilter = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const allowedPaths = ["/", "/css", "/assets", "/scripts", "/trips"];
  const requestPath = req.path;

  const isAllowed = allowedPaths.some((allowedPath) =>
    requestPath.startsWith(allowedPath)
  );

  if (isAllowed) {
    return next();
  }

  res.status(403).send("Access to this resource is forbidden.");
};

/**
 * Usa el middleware personalizado para filtrar archivos estáticos.
 */
app.use(staticFileFilter);

app.use(express.json());

/**
 * Ruta para cerrar el servidor de forma segura.
 *
 * Detiene el proceso del servidor después de 1 segundo.
 */
app.get("/closeServer", () => {
  setTimeout(() => process.exit(0), 1000);
});

/**
 * Une la ruta pública con el nombre de un archivo específico.
 *
 * @param {string} file - Nombre del archivo a unir con la ruta pública.
 * @returns {string} - Ruta completa al archivo especificado.
 */
export const pathFile = (file: string): string => path.join(publicPath, file);

export default app;
