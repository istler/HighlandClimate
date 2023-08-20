'use strict';

const mqtt = require('mqtt');

class MqttHelper {

    mqttConnectOptions = { clean: true, connectTimeout: 4000 };
    mqttMessageOpts = { qos: 1, retain: true };

    constructor(options = {}) {
        this._options = {...options };
    }

    /**
     * Connect to MQTT broker
     */
    connect() {
        this.mqttClient  = mqtt.connect(this.getUrl(), this.mqttConnectOptions);

        if (this._options.debugTopics) {
            console.log('Subscribing to topics: ', this._options.debugTopics);
            this.mqttClient.subscribe(this._options.debugTopics);
            this.mqttClient.on('message', this.handleMessage);
        }
        this.mqttClient.on('error', this.handleError);
    }

    getUrl() {
        return this._options.url;
    }

    handleError(error) {
        console.log('mqttClient error', error);
    }

    handleMessage(topic, message) {
        //console.log('mqttClient message', topic, message.toString());
    }

    publish(topic, message) {
        //console.log('mqttClient publish', topic, message);
        this.mqttClient.publish(topic, message, this.mqttMessageOpts);
    }
}

module.exports = {
    MqttHelper
};