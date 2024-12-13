import { CaudalModel } from "../models/caudal_bd.js"
import { processInfo } from "../scrapers/scrapping.js"

export const getStations = async (req, res) => {
    const stations = await CaudalModel.obtenerEstaciones();
    if (!stations) {
        return res.status(400).json({ok: false, message: "No hay registros almacenados en base de datos, ejecute el enpoint de SCRAPER",})
    }

    res.status(200).json({
        ok: true,
        data: stations
    })
}

export const getStationById = async (req, res) => {
    const { id } = req.params;
    const obra = await CaudalModel.caudalByCode(id);
    if (!obra) {
        return res.status(400).json({ok: false, message: "No hay registros almacenados en base de datos, ejecute el enpoint de SCRAPER",})
    }
    res.status(200).json({
        ok: true,
        data: obra
    })
}

export const processData = async (req, res) => {
    const { fechaDesde, fechaHasta, obras } = req.body;
    const process = await processInfo(fechaDesde, fechaHasta, obras);
    if (!process) {
        return res.status(200).json({message: "La fuente esta con intermitencia, intentelo mas tarde"})
    }

    const insertBD = await CaudalModel.guardarInfoDb(process);
    if (!insertBD) {
        return res.status(400).json({
            ok: false,
            message: "No se pudo guardar la informacion en base de datos",
            data: process
        })
    }
    res.status(200).json({
        ok: true,
        data: process
    })
}

export const getStationByDate = async (req, res) => {
    const { id } = req.params;
    const { fechaDesde, fechaHasta } = req.body;

    const data = await CaudalModel.caudalByCodeDate(id, fechaDesde, fechaHasta);
    if (!data) {
        return res.status(400).json({
            ok: false,
            message: `No hay registros de medicion de caudales entre ${fechaDesde} | ${fechaHasta} - Para la obra ${id}`,
        })
    }
    res.status(200).json({
        ok: true,
        caudales: data
    })
}