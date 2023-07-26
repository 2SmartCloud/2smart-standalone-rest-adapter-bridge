const Debugger      = require('homie-sdk/lib/utils/debugger');
const express       = require('express');
const TopicsManager = require('./lib/TopicsManager');

const debug = new Debugger(process.env.DEBUG || '');

debug.initEvents();
global.debug = debug;

try {
    global.topicsManager = new TopicsManager({
        mqttConnection : {
            username : process.env.MQTT_USER || undefined,
            password : process.env.MQTT_PASS || undefined,
            uri      : process.env.MQTT_URI || undefined
        },
        allowedTopics : process.env.ALLOWED_TOPICS
    });
    global.topicsManager.on('error', (e) => {
        debug.error(e);
    });
    global.topicsManager.on('exit', (reason, exit_code) => {
        debug.info('RestAdapter.exit', reason);
        process.exit(exit_code);
    });
    global.topicsManager.init();

    const middlewares = require('./lib/middlewares');
    const router      = require('./lib/router');

    require('./lib/registerValidationRules');

    const APP_PORT = process.env.APP_PORT || 6060;

    const app = express();

    middlewares(app);
    app.use('/api/v1', router);

    app.listen(APP_PORT);

    console.log(JSON.stringify({ level: 'info', message: `APP STARTING AT PORT ${APP_PORT}` }));
} catch (e) {
    global.debug.error(e);
    process.exit(1);
}
