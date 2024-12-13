import axios from "axios";
import moment from "moment";

// Códigos de obra a consultar
export const DEFAULT_CODIGOS_OBRA = [
    'OB-1401-29',
    'OB-1305-1106',
    'OB-1002-370',
    'OB-1303-1255',
    'OB-1303-1072',
];


async function obtenerToken() {
    try {
      const response = await axios.post('https://snia.mop.gob.cl/mee-auth-rest/v1/authorization', {
        // Parámetros requeridos para obtener el token
        apiCode: "MEESECINT",
        apiKey: "73A58577C1CCB258DFD79116EAD8F",
        app: "exponline"
      });
      return response.data.accessToken;
    } catch (error) {
      if (error.status === 502) {
        console.error('Error obteniendo el token, la fuente esta con intermitencia!:', error.status);
        throw {status: 502};
      }
    }
}


// Función para obtener el caudal de una obra
async function obtenerCaudalPorObra(codigoObra, fechaInicio, fechaFin, headers, intent = 1) {
    const url = `https://snia.mop.gob.cl/extracciones/data/medicion/extracciones`;

    try {
      const response = await axios.post(url, {
        data: {
            codigoObra: null,
            fechaDesde: fechaInicio,
            fechaHasta: fechaFin,
            obras: [
                {
                  "codigoObra": codigoObra
                }
            ]
        },
        metaData: {paginator: null, token: null, userName: null}
      } ,{ headers });

      const data = response.data.data[0]

      const filteredData = data.filter(item => item.caudal !== null).map(item => ({ 
        caudal: item.caudal, 
        alturaLimnimetrica: item.alturaLimnimetrica, 
        fechaHoraMedicion: moment(item.fechaHoraMedicion).toISOString()
      }));
      
      return filteredData;
    } catch (error) {
      console.error(`Error obteniendo caudales de la obra ${codigoObra}:`, error.status);
      if (error.status === 502 && intent < 3) {
        console.log("Error en la fuente, Reintentamos!")
        return obtenerCaudalPorObra(codigoObra, fechaInicio, fechaFin, headers, intent + 1)
      }
      else {
        return [];
      }
    }
}

async function obtenerInfoObra(codigoObra, headers, intent=1) {
  const url = `https://snia.mop.gob.cl/extracciones/data/obraCaptacion/obtenerObraResumen`;
  try {
    const response = await axios.post(url, {
      data: {
          codigoObra: codigoObra,
      },
      metaData: {paginator: null, token: null, userName: null}
    } ,{ headers });

    const data = response.data.data
    //data.status === 502 // -> Puede darse el caso que la fuente se caiga y entregue 502
    
    return {
      idObra: data.idObra,
      codigoObra: data.codigoObra,
      ultimaMedicion: {
        caudal: data.itemInformeMedicion.caudal,
        fechaHoraMedicion: moment(data.itemInformeMedicion.fechaHoraMedicion).toISOString()
      },
      direccion: {
        region: data.region,
        provincia: data.provincia,
        comuna: data.comuna,
        norte: data.norte,
        este: data.este
      }
    };
  } catch (error) {
    console.error(`Error obteniendo informacion de la obra ${codigoObra}:`, error.status || "Sin Estado");
    if (error.status === 502 & intent <= 3) {
      console.log("Error en la fuente, Reintentamos!")
      return obtenerInfoObra(codigoObra, headers, intent + 1)
    }
    else {
      return {};
    }
  }
}


 // Punto de entrada principal al scraper
export const processInfo = async (fechaInicio, fechaFin, obras= []) => {
  try {
    const obrasToProcess = obras.length > 0 ? obras : DEFAULT_CODIGOS_OBRA;
    const token = await obtenerToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Origin': 'https://snia.mop.gob.cl',
      'Referer': 'https://snia.mop.gob.cl',
      'Cookie': '__uzmc=721417920890; __uzmd=1733956167'
  };

    const infoPromises = obrasToProcess.map(async (obra) => {
      const infoObra = await obtenerInfoObra(obra, headers);
      const caudalObra = await obtenerCaudalPorObra(obra, fechaInicio, fechaFin, headers);
      return { ...infoObra, caudales: caudalObra };
    });

    const info = await Promise.all(infoPromises);  
      
    return info;
  } catch (error) {
    console.error('Error en la ejecución principal:', error);
    return false
  }
}