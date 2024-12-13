import axios from 'axios';
import moment from 'moment';

const BASE_URL = 'https://snia.mop.gob.cl';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json;charset=UTF-8',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36',
  'Origin': BASE_URL,
  'Referer': BASE_URL,
  'Cookie': '__uzmc=721417920890; __uzmd=1733956167'
};

async function obtenerToken() {
  try {
    const response = await axios.post(`${BASE_URL}/mee-auth-rest/v1/authorization`, {
      apiCode: "MEESECINT",
      apiKey: "73A58577C1CCB258DFD79116EAD8F",
      app: 'exponline'
    });
    return response.data.accessToken;
  } catch (error) {
    throw new Error('Error obteniendo el token');
  }
}

async function postRequest(url, data, headers, intent = 1, maxIntent = 3) {
  try {
    const response = await axios.post(url, data, { headers });
    if (!response.data.data) {
      throw new Error('La respuesta de la API no contiene los datos esperados.');
    }
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 502 && intent < maxIntent) {
      return postRequest(url, data, headers, intent + 1, maxIntent);
    }
    return null;
  }
}

async function obtenerInfoObra(codigoObra, headers) {
  const url = `${BASE_URL}/extracciones/data/obraCaptacion/obtenerObraResumen`;
  const data = { data: { codigoObra }, metaData: {paginator: null, token: null, userName: null} };
  const response = await postRequest(url, data, headers);
  if (response) {
    return {
      idObra: response.idObra,
      codigoObra: response.codigoObra,
      ultimaMedicion: {
        caudal: response.itemInformeMedicion.caudal,
        fechaHoraMedicion: moment(response.itemInformeMedicion.fechaHoraMedicion).format('YYYY-MM-DD HH:mm:ss')
      },
      direccion: {
        region: response.region,
        provincia: response.provincia,
        comuna: response.comuna,
        norte: response.norte,
        este: response.este
      }
    };
  }
}

async function obtenerCaudalPorObra(codigoObra, fechaInicio, fechaFin, headers) {
  const url = 'https://snia.mop.gob.cl/extracciones/data/medicion/extracciones';
  const data = {
    data: { codigoObra: null, fechaDesde: fechaInicio, fechaHasta: fechaFin, obras: [{ codigoObra }] },
    metaData: { paginator: null, token: null, userName: null }
  };

  const responseData = await postRequest(url, data, headers);

  return responseData[0].filter(item => item.caudal !== null).map(item => ({
      caudal: item.caudal,
      alturaLimnimetrica: item.alturaLimnimetrica,
      fechaHoraMedicion: moment(item.fechaHoraMedicion).format('YYYY-MM-DD HH:mm:ss')
    }));
}

export async function processInfo(fechaInicio, fechaFin, obras = DEFAULT_CODIGOS_OBRA) {
  try {
    const token = await obtenerToken();
    const headers = { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` };
    const infoPromises = obras.map(async (obra) => {

      const infoObra = await obtenerInfoObra(obra, headers);
      const caudalObra = await obtenerCaudalPorObra(obra, fechaInicio, fechaFin, headers);

      if (!infoObra && caudalObra.length === 0) {
        return { tipo: 'no_existente', obra }; 
      }

      return { tipo: 'existente', ...infoObra, caudales: caudalObra };
    });

    const resultados = await Promise.all(infoPromises);
    
    const info = resultados.filter(result => result.tipo === 'existente');
    const datosNoExistentes = resultados.filter(result => result.tipo === 'no_existente').map(result => result.obra);

    return {info, datosNoExistentes};
  } catch (error) {
    console.log(error)
    throw new Error('Error en la ejecución principal');
  }
}
