const ServiceBaseModule                        = require('chista/ServiceBase');
const X                                        = require('../repaired_chista_exception');
const { allowedTopicsToRetrieveValidEntities } = require('../../etc/config');

const ServiceBase = ServiceBaseModule.default;

const { ERROR_CODES } = require('../errors');

const topicsManager = global.topicsManager;

class BaseService extends ServiceBase {
    async execute() {
        throw new Error('Execute is not implemented!');
    }

    async checkPermissions() {
        await this.checkState();
    }

    checkTopicsPermissions(deviceId) {
        // user can retrieve valid entity only if this entity has valid device
        // so user have to give access to all device topics to build valid device
        const allowedTopicsToRetrieveValidEntity = [
            ...allowedTopicsToRetrieveValidEntities,
            `sweet-home/${deviceId}/#` // append specific for each entity topic
        ];
        const allowedTopics = topicsManager.getAllowedTopics();
        const hasPermissions = allowedTopicsToRetrieveValidEntity.some(topic => allowedTopics.includes(topic));

        if (!hasPermissions) {
            throw new X({
                code    : ERROR_CODES.ACCESS_DENIED,
                message : 'Not enough permissions to retrieve entity'
            });
        }
    }

    async checkState() {
        if (!topicsManager.initialized) throw new X({ code: 'NOT_INITIALIZED', message: 'Server is not initialized yet. Please, wait.' });
        if (!topicsManager.homie.online) throw new X({ code: 'NOT_CONNECTED', message: 'Server is not connected to mqtt broker.' });
        if (!topicsManager.homie.synced) throw new X({ code: 'NOT_SYNCED', message: 'Topics are not synced yet. Please, wait.' });
    }
}

module.exports = BaseService;
