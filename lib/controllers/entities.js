const chista = require('../chista');

const EntitiesListDevices = require('../services/entities/ListDevices');
const EntitiesShowDevice = require('../services/entities/ShowDevice');
const EntitiesShowNode = require('../services/entities/ShowNode');
const EntitiesShowSensor = require('../services/entities/ShowSensor');
const EntitiesShowOption = require('../services/entities/ShowOption');
const EntitiesShowTelemetry = require('../services/entities/ShowTelemetry');

module.exports = {
    listDevices   : chista.makeServiceRunner(EntitiesListDevices, req => req.query),
    showDevice    : chista.makeServiceRunner(EntitiesShowDevice, req => req.query),
    showNode      : chista.makeServiceRunner(EntitiesShowNode, req => req.query),
    showSensor    : chista.makeServiceRunner(EntitiesShowSensor, req => req.query),
    showOption    : chista.makeServiceRunner(EntitiesShowOption, req => req.query),
    showTelemetry : chista.makeServiceRunner(EntitiesShowTelemetry, req => req.query)
};
