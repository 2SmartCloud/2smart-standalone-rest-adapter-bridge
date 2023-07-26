const { ERROR_CODES } = require('../../errors');
const X               = require('../../repaired_chista_exception');

const ServiceBase = require('./../BaseService');

const {
    topicsManager,
    debug
} = global;

class ShowDevice extends ServiceBase {
    static validationRules = {
        only_ids : [ 'boolean' ]
    };

    // regexps to have access to any device, without it user will get ACCESS_DENIED error
    static allowedTopicsRegExpsToRetrieveValidDevices = [
        /^#$/,
        /^sweet-home\/#$/,
        /^sweet-home\/\+\/#$/,
        /^sweet-home\/[a-z0-9][a-z0-9-]*[a-z0-9]\/#$/
    ];

    async execute({ only_ids }) {
        const allowedTopics = topicsManager.getAllowedTopics();
        const hasAccessToAnyDevice = ShowDevice.allowedTopicsRegExpsToRetrieveValidDevices
            .some(regExp => allowedTopics.some(allowedTopic => regExp.test(allowedTopic)));

        if (!hasAccessToAnyDevice) {
            throw new X({
                code    : ERROR_CODES.ACCESS_DENIED,
                message : 'Not allowed topic'
            });
        }

        const devices = topicsManager.homie.getDevices();

        const result = [];

        for (const device of Object.values(devices)) {
            try {
                result.push(only_ids ? device.id : device.serialize());
            } catch (err) {
                debug.warning('RestAdapter.ListDevices', err);
            }
        }

        return {
            status : 1,
            data   : {
                devices : result
            }
        };
    }
}

module.exports = ShowDevice;
