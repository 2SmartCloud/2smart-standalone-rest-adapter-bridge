const X               = require('../../repaired_chista_exception');
const ServiceBase     = require('./../BaseService');

const topicsManager = global.topicsManager;

class ShowDevice extends ServiceBase {
    static validationRules = {
        deviceId : [ 'required', 'string', { 'custom_error_code': [ 'WRONG_DEVICE_ID', 'like', '^[a-z0-9-]+$' ] } ]
    };

    async execute({ deviceId }) {
        this.checkTopicsPermissions(deviceId);

        let device;

        try {
            device = topicsManager.homie.getDeviceById(deviceId).serialize();
        } catch (e) {
            throw new X(e);
        }

        return {
            status : 1,
            data   : {
                device
            }
        };
    }
}

module.exports = ShowDevice;
