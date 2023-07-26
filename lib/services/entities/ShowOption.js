const X               = require('../../repaired_chista_exception');
const ServiceBase     = require('./../BaseService');

const topicsManager = global.topicsManager;

class ShowSensor extends ServiceBase {
    static validationRules = {
        deviceId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_DEVICE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        nodeId   : [ 'string', { 'custom_error_code': [ 'WRONG_NODE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        optionId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_OPTION_ID', 'like', '^[a-z0-9-]+$' ] } ]
    };

    async execute({ deviceId, nodeId, optionId }) {
        this.checkTopicsPermissions(deviceId);

        let option;

        try {
            let entity = topicsManager.homie.getDeviceById(deviceId);

            if (nodeId) entity = entity.getNodeById(nodeId);

            option = entity.getOptionById(optionId).serialize();
        } catch (e) {
            throw new X(e);
        }

        return {
            status : 1,
            data   : {
                option
            }
        };
    }
}

module.exports = ShowSensor;
