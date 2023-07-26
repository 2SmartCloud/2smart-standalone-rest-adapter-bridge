/* eslint-disable key-spacing */
let EntitiesShowOption;
const TopicsManager     = require('../../../lib/TopicsManager');


jest.setTimeout(30000);

let topicsManager;
// eslint-disable-next-line jest/no-mocks-import
const topics = require('../../fixtures/__mocks__/devices');

// eslint-disable-next-line max-lines-per-function
describe('EntitiesShowOption service', () => {
    beforeAll(async () => {
        topicsManager = new TopicsManager({
            mqttConnection : {
                username : process.env.MQTT_USER || undefined,
                password : process.env.MQTT_PASS || undefined,
                uri      : process.env.MQTT_URI || undefined
            }
        });
        topicsManager.on('error', (e) => {
            console.log(e);
        });
        topicsManager.on('exit', (reason, exit_code) => {
            console.log('RestAdapter.exit', reason);
            process.exit(exit_code);
        });
        global.topicsManager = topicsManager;
        EntitiesShowOption = require('../../../lib/services/entities/ShowOption');
        topicsManager.initialized = true;
        topicsManager.homie.online = true;
        topicsManager.homie.synced = true;
        for (const [ topic, value ] of Object.entries(topics)) {
            // topicsManager.transport.emit('message', topic, Buffer.from(value));
            topicsManager.homie._handleMessage(topic, Buffer.from(value));
        }
    });


    test('POSITIVE: get option of a node', async () => {
        const service = new EntitiesShowOption({ context: {} });

        const res = await service.run({ deviceId: 'test-device', nodeId: 'controls', optionId: 'signal' });

        expect(res.data.option.id).toEqual('signal');
    });

    test('POSITIVE: get option of a device', async () => {
        const service = new EntitiesShowOption({ context: {} });

        const res = await service.run({ deviceId: 'dynamic-device', optionId: 'signal' });

        expect(res.data.option.id).toEqual('signal');
    });

    test('NEGATIVE: get option of nonexistent device', async () => {
        const service = new EntitiesShowOption({ context: {} });

        try {
            await service.run({ deviceId: 'test-nonexistent-device', nodeId: 'controls', optionId: 'signal' });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
    test('NEGATIVE: get option of nonexistent node', async () => {
        const service = new EntitiesShowOption({ context: {} });

        try {
            await service.run({ deviceId: 'test-device', nodeId: 'nonexistent-node', optionId: 'int-true'  });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
    test('NEGATIVE: get nonexistent option', async () => {
        const service = new EntitiesShowOption({ context: {} });

        try {
            await service.run({ deviceId: 'test-device', nodeId: 'controls', optionId: 'nonexistent-int-true'  });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
});
