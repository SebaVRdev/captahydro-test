import app from "./app.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try { 
      app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('No se pudo conectar a la base de datos:', error);
    }
};

startServer();