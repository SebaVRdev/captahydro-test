import mysql from "mysql2/promise";
import { DATABASE_VAR } from "./config.js";

/**
 * Configuración por defecto para la conexión a la base de datos.
 * @type {Object}
 * @property {string} host - El host del servidor de la base de datos.
 * @property {string} user - El nombre de usuario para la base de datos.
 * @property {number} port - El puerto de la base de datos.
 * @property {string} password - La contraseña para la base de datos.
 * @property {string} database - El nombre de la base de datos.
 */

const DEFAULT_CONFIG = {
    host: DATABASE_VAR.host,
    user: DATABASE_VAR.user,
    port: DATABASE_VAR.port,
    password: DATABASE_VAR.password,
    database: DATABASE_VAR.database
}

let connection = null;

export async function connect() {
    try {
        if (!connection) {
            connection = await mysql.createConnection(DEFAULT_CONFIG);
            console.log('Connected to MySQL database');
        }
        return connection;
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        throw error;
    }
}

export async function disconnect() {
    try {
        if (connection) {
            await connection.end();
            console.log('Disconnected from MySQL database');
            connection = null;
        }
    } catch (error) {
        console.error('Error disconnecting from MySQL:', error);
        throw error;
    }
}
