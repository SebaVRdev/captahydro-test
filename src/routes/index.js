import { Router } from "express";
import moment from "moment";
import { getStationByDate, getStationById, getStations, processData } from "../controllers/index.js";

const router = Router();

const validateDateFormat = (req, res, next) => { 
    let { fecha_inicio, fecha_fin } = req.body; 

    if (!fecha_inicio || !fecha_fin) {
        const currentDate = moment(); 
        fecha_inicio = currentDate.clone().subtract(48, 'hours').format('YYYY-MM-DD'); 
        fecha_fin = currentDate.endOf('day').format('YYYY-MM-DD');
    }

    const isFechaInicioValid = moment(fecha_inicio, 'YYYY-MM-DD', true).isValid();
    const isFechaFinValid = moment(fecha_fin, 'YYYY-MM-DD', true).isValid();

    if (!isFechaInicioValid || !isFechaFinValid) {
        return res.status(400).json({
            error: 'Las fechas deben estar en el formato YYYY-MM-DD.'
        });
    }

    const fechaInicioISO = moment(fecha_inicio).startOf('day').toISOString();  
    const fechaFinISO = moment(fecha_fin).endOf('day').toISOString();
    
    req.body.fechaDesde = fechaInicioISO;
    req.body.fechaHasta = fechaFinISO;
    
    next(); 
};

router.get('/stations', getStations)
router.get('/stations/:id', getStationById)
router.get('/stations/:id/flow', validateDateFormat, getStationByDate)
router.post('/scraper', validateDateFormat ,processData);

export default router;