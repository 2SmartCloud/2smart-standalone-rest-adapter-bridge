/* eslint-disable key-spacing */
let EntitiesShowTelemetry;
const TopicsManager     = require('../../../lib/TopicsManager');


jest.setTimeout(30000);

let topicsManager;
// eslint-disable-next-line jest/no-mocks-import
const topics = require('../../fixtures/__mocks__/devices');

// eslint-disable-next-line max-lines-per-function
describe('EntitiesShowTelemetry service', () => {
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
        EntitiesShowTelemetry = require('../../../lib/services/entities/ShowTelemetry');
        topicsManager.initialized = true;
        topicsManager.homie.online = true;
        topicsManager.homie.synced = true;
        for (const [ topic, value ] of Object.entries(topics)) {
            // topicsManager.transport.emit('message', topic, Buffer.from(value));
            topicsManager.homie._handleMessage(topic, Buffer.from(value));
        }
    });


    test('POSITIVE: get telemetry of a node', async () => {
        const service = new EntitiesShowTelemetry({ context: {} });

        const res = await service.run({ deviceId: 'dynamic-device', nodeId: 'controls', telemetryId: 'signal' });

        expect(res.data.telemetry.id).toEqual('signal');
    });

    test('POSITIVE: get telemetry of a device', async () => {
        const service = new EntitiesShowTelemetry({ context: {} });

        const res = await service.run({ deviceId: 'dynamic-device', telemetryId: 'signal' });

        expect(res.data.telemetry.id).toEqual('signal');
    });

    test('NEGATIVE: get telemetry of nonexistent device', async () => {
        const service = new EntitiesShowTelemetry({ context: {} });

        try {
            await service.run({ deviceId: 'test-nonexistent-device', nodeId: 'controls', telemetryId: 'signal' });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
    test('NEGATIVE: get telemetry of nonexistent node', async () => {
        const service = new EntitiesShowTelemetry({ context: {} });

        try {
            await service.run({ deviceId: 'test-device', nodeId: 'nonexistent-node', telemetryId: 'int-true'  });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
    test('NEGATIVE: get nonexistent telemetry', async () => {
        const service = new EntitiesShowTelemetry({ context: {} });

        try {
            await service.run({ deviceId: 'test-device', nodeId: 'controls', telemetryId: 'nonexistent-int-true'  });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
});
