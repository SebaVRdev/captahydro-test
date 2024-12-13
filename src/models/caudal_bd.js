import { connect } from "../config/bd.config.js"
import moment from "moment";

export class CaudalModel {

    static async obraByCodigo(codigoObra) {
        const connection = await connect();
        const [obra] = await connection.execute(
            'SELECT * FROM obras WHERE codigo_obra = ?',
            [codigoObra]
        );
        if (obra.length > 0) {
            return obra[0]
        }
        return false;
    }

    static async saveObraDB(obra){
        const connection = await connect();
        const { codigoObra, direccion, ultimaMedicion } = obra;
        const [result] = await connection.execute(
            'INSERT INTO obras (codigo_obra, ultimo_caudal ,region, provincia, comuna, coordenada_norte, coordenada_este) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [codigoObra, ultimaMedicion.caudal, direccion.region, direccion.provincia, direccion.comuna, direccion.norte, direccion.este]
        );
        if (result.affectedRows > 0) {
            return await this.obraByCodigo(codigoObra)
        }
        return false;
    }

    static async saveCaudalDB(caudal, obraToSave) {
        const connection = await connect();
        const { caudal: caudalValor, alturaLimnimetrica, fechaHoraMedicion } = caudal;
        const formattedFechaHoraMedicion = moment(fechaHoraMedicion).format('YYYY-MM-DD HH:mm:ss');

        // Verificar si el caudal ya existe para esa obra y fecha
        const [caudalRows] = await connection.execute(
            'SELECT id FROM caudales WHERE codigo_obra = ? AND fecha_hora_medicion = ?',
        [obraToSave.codigo_obra, formattedFechaHoraMedicion]);
                
        if (caudalRows.length === 0) {
          // Si el caudal no existe, insertarlo
          await connection.execute(
            'INSERT INTO caudales (codigo_obra, caudal, altura_limnimetrica, fecha_hora_medicion) VALUES (?, ?, ?, ?)',
            [obraToSave.codigo_obra, caudalValor, alturaLimnimetrica, formattedFechaHoraMedicion]
          );
        } 
    }

    static async updateUltimoCaudal(obra) {
        const connection = await connect();
        const { codigoObra, ultimaMedicion } = obra;
        const [result] = await connection.execute(
            `UPDATE obras SET ultimo_caudal = ? WHERE codigo_obra = ?;`,
            [ultimaMedicion.caudal, codigoObra]
        );
        if (result.affectedRows > 0) {
            return await this.obraByCodigo(codigoObra)
        }
    }
    
    static async guardarInfoDb(data){
        try {
            for (const obra of data) {
              const { caudales } = obra;
            
              let obraToSave = await this.obraByCodigo(obra.codigoObra);
                
              if (!obraToSave) {
                obraToSave = await this.saveObraDB(obra)  
              } else {
                // Si la obra ya existe, se espera que el ultimo caudal haya cambiado, por lo que lo modificamos
                await this.updateUltimoCaudal(obra); 
              }
        
              for (const caudal of caudales) {
                await this.saveCaudalDB(caudal, obraToSave);
              } 
            }    
            console.log('Información procesada y almacenada correctamente');
            return true;
        } catch (error) {
            console.error('Error en el procesamiento de la información:', error.message);
            return false;
        }
    }

    static async obtenerEstaciones() {
        const connection = await connect();
        const [caudales] = await connection.execute(`
            SELECT o.codigo_obra, o.ultimo_caudal, c.caudal as ultimo_caudal_medido
            FROM obras o
            JOIN (
                SELECT codigo_obra, MAX(fecha_hora_medicion) AS fecha_mas_reciente
                FROM caudales
                GROUP BY codigo_obra
            ) subquery ON o.codigo_obra = subquery.codigo_obra
            JOIN caudales c ON c.codigo_obra = subquery.codigo_obra AND c.fecha_hora_medicion = subquery.fecha_mas_reciente;`)
        if (caudales.length > 0) {
            return caudales
        }
        return false;
    }

    static async caudalByCode(codigoObra) {
        const connection = await connect();
        const [result] = await connection.execute(`SELECT * FROM obras WHERE codigo_obra = ?;`,[codigoObra]);
        if (result.length > 0) {
            return result[0];
        }
        return false;
    }

    static async caudalByCodeDate(codigoObra, fechaDesde, fechaHasta){
        const fechaInicioFormated = moment(fechaDesde).format('YYYY-MM-DD HH:mm:ss');
        const fechaFinFormated = moment(fechaHasta).format('YYYY-MM-DD HH:mm:ss');

        const connection = await connect();
        const [caudales] = await connection.execute(
            `SELECT * FROM caudales
            WHERE codigo_obra = ? 
            AND fecha_hora_medicion BETWEEN ? AND ?
            ORDER BY fecha_hora_medicion ASC;`,
            [codigoObra, fechaInicioFormated, fechaFinFormated]
        );
        if (caudales.length > 0) {
            return caudales
        } 
        return false;
    }
}