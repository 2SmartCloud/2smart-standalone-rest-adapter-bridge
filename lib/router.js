const express     = require('express');
const controllers = require('./controllers');

const router = express.Router();

router.get('/topics', controllers.topics.get);
router.post('/topics/set', controllers.topics.set);
router.get('/devices', controllers.entities.listDevices);
router.get('/device', controllers.entities.showDevice);
router.get('/node', controllers.entities.showNode);
router.get('/sensor', controllers.entities.showSensor);
router.get('/option', controllers.entities.showOption);
router.get('/telemetry', controllers.entities.showTelemetry);


module.exports = router;
