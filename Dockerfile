FROM node:18-alpine

WORKDIR /app

# Copia los archivos de la aplicación
COPY package*.json ./


RUN npm install

COPY . .


EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
