const X               = require('../../repaired_chista_exception');
const ServiceBase     = require('./../BaseService');

const topicsManager = global.topicsManager;

class ShowSensor extends ServiceBase {
    static validationRules = {
        deviceId    : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_DEVICE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        nodeId      : [ 'string', { 'custom_error_code': [ 'WRONG_NODE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        telemetryId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_TELEMETRY_ID', 'like', '^[a-z0-9-]+$' ] } ]
    };

    async execute({ deviceId, nodeId, telemetryId }) {
        this.checkTopicsPermissions(deviceId);

        let telemetry;

        try {
            let entity = topicsManager.homie.getDeviceById(deviceId);

            if (nodeId) entity = entity.getNodeById(nodeId);

            telemetry = entity.getTelemetryById(telemetryId).serialize();
        } catch (e) {
            throw new X(e);
        }

        return {
            status : 1,
            data   : {
                telemetry
            }
        };
    }
}

module.exports = ShowSensor;
