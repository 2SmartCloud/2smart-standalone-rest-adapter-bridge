const X               = require('../../repaired_chista_exception');
const ServiceBase     = require('./../BaseService');

const topicsManager = global.topicsManager;

class ShowSensor extends ServiceBase {
    static validationRules = {
        deviceId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_DEVICE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        nodeId   : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_NODE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        sensorId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_SENSOR_ID', 'like', '^[a-z0-9-]+$' ] } ]
    };

    async execute({ deviceId, nodeId, sensorId }) {
        this.checkTopicsPermissions(deviceId);

        let sensor;

        try {
            sensor = topicsManager.homie
                .getDeviceById(deviceId)
                .getNodeById(nodeId)
                .getSensorById(sensorId)
                .serialize();
        } catch (e) {
            throw new X(e);
        }

        return {
            status : 1,
            data   : {
                sensor
            }
        };
    }
}

module.exports = ShowSensor;
