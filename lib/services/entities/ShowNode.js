const X               = require('../../repaired_chista_exception');
const ServiceBase     = require('./../BaseService');

const topicsManager = global.topicsManager;

class ShowNode extends ServiceBase {
    static validationRules = {
        deviceId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_DEVICE_ID', 'like', '^[a-z0-9-]+$' ] } ],
        nodeId   : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_NODE_ID', 'like', '^[a-z0-9-]+$' ] } ]
    };

    async execute({ deviceId, nodeId }) {
        this.checkTopicsPermissions(deviceId);

        let node;

        try {
            node = topicsManager.homie.getDeviceById(deviceId).getNodeById(nodeId).serialize();
        } catch (e) {
            throw new X(e);
        }

        return {
            status : 1,
            data   : {
                node
            }
        };
    }
}

module.exports = ShowNode;
