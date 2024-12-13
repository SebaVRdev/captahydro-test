CREATE DATABASE IF NOT EXISTS  captahydrotest;

USE captahydrotest;

CREATE TABLE obras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_obra VARCHAR(255) UNIQUE,
    ultimo_caudal FLOAT,
    region VARCHAR(255),
    provincia VARCHAR(255),
    comuna VARCHAR(255),
    coordenada_norte INT,
    coordenada_este INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE caudales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_obra VARCHAR(255),
    caudal FLOAT,
    altura_limnimetrica FLOAT,
    fecha_hora_medicion DATETIME,
    FOREIGN KEY (codigo_obra) REFERENCES obras(codigo_obra) ON DELETE CASCADE,
    UNIQUE(codigo_obra, fecha_hora_medicion)
);