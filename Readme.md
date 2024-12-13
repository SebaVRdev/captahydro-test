# Ejecutar proyecto

---

## Requisitos previos
1. **Docker** y **Docker Desktop** deben estar instalados en su sistema.
2. Tener **Node.js** y **npm** instalados para la gestión de dependencias.

---

## Instrucciones de instalación y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/SebaVRdev/captahydro-test.git
   ```

2. **Acceder a la carpeta del proyecto**
   ```bash
   cd edutagger
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```
4. **Copiar variables de entorno**
    ```bash
    cp .env.dev .env
    ```

5. **Levantar la aplicación con Docker**
   ```bash
   docker-compose up -d
   ```

6. **Esperar a que todos los contenedores se levanten correctamente.**

---

## Conexión a la base de datos

- La base de datos MySQL se encuentra disponible en el puerto **3305** (diferente del puerto por defecto **3306** de MySQL local).
- Datos de conexión:
  - **Host:** localhost
  - **Puerto:** 3305
  - **Usuario:** root
  - **Contraseña:** seba123

Si tienes MySQL instalado localmente, asegúrate de no tener conflictos de puertos con el 3306.

---

## Acceso a la API
- La API estará disponible en la URL:
  ```
  http://localhost:3000/api
  ```

---

⚠️ **NOTA IMPORTANTE:**
Los enpoints para solicitar información requieren de que la base de datos este poblada.
Se recomienda ejecutar el endpoint del scraper con las fechas necesarias para guardar en base de datos. 

## Endpoints disponibles
A continuación se describen los cuatro endpoints principales de la API.

1. **POST /scrape**
   - **Descripción:** Ejecuta el proceso de scraping en la fuente.
   - **Parámetros de entrada:** 
   ```json
     {
        "fecha_inicio": "YYYY-MM-DD",
        "fecha_fin": "YYYY-MM-DD",
        "obras": ["codigo_obra"]
     }
    ```
    **En caso de no mandar ningun parametro, el scraper se ejecuta con la fecha de los ultimos 2 dias y con un set de obras por defecto.**
   - **Respuesta de ejemplo:** Entrega la informacion obtenida y ok: boolean | true en caso de que se haya guardado la información exitosamente.
 
2. **GET /stations**
   - **Descripción:** Entrega todas las obras con su ultimo caudal.
   - **Parámetros de entrada:** Ninguno
   - **Respuesta de ejemplo:** Lista de todos las obras

3. **GET /stations/:codigo_obra**
   - **Descripción:** Detalle de la obra.
   - **Parámetros de entrada:** codigo_obra
   - **Respuesta de ejemplo:**
     ```json
     {
        "ok": true,
        "data": {
            "id": 1,
            "codigo_obra": "OB-1303-1072",
            "ultimo_caudal": 8268.66015625,
            "region": "Metropolitana",
            "provincia": "Maipo",
            "comuna": "Buin",
            "coordenada_norte": 6276027,
            "coordenada_este": 348488,
            "created_at": "2024-12-13T14:51:21.000Z"
        }
    }
     ```

4. **GET /stations/:codigo_obra/flow**
   - **Descripción:** Entrega todos los caudales de una obra entre un rango de fechas.
   - **Parámetros de entrada:** codigo_obra, fecha_inicio (YYYY-MM-DD) y fecha_fin (YYYY-MM-DD)
   ```json
     {
        "fecha_inicio": "YYYY-MM-DD",
        "fecha_fin": "YYYY-MM-DD"
    }
    ```
    **En caso de no mandar ningun parametro, el scraper se ejecuta con la fecha de los ultimos 2 dias y con un set de obras por defecto.**
   - **Respuesta de ejemplo:**
     ```json
     {
       "ok": true,
        "caudales": [
            {
                "id": 1,
                "codigo_obra": "OB-1303-1072",
                "caudal": 8125.33984375,
                "altura_limnimetrica": 110,
                "fecha_hora_medicion": "2024-12-11T00:00:00.000Z"
            },
        ]
     }
     ```

---

## Notas importantes
- **Verifica la configuración del puerto 3305** si tienes MySQL local corriendo en tu máquina, ya que el puerto 3306 suele estar ocupado por la instalación local.
- La contraseña de la base de datos es **seba123**.
- El contenedor Docker se asegurará de que la base de datos y la API estén en funcionamiento correctamente.

Para cualquier problema o duda, por favor comuníquese a mi numero de telefono +56 958138659. 



