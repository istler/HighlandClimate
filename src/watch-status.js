
//const Gree = require ('../../src/client.js');
require('source-map-support').install();
const Gree = require ('@istler/gree-hvac-client');
const BuildingClimate = require ('./building-climate.js');
const WebClient = require('./web.js');
const mqttHelper = require('./mqtt-helper.js');

const {
    MQTT_PORT,
    MQTT_HOST,
    WATCH_POLL_TIMEOUT
  } = process.env;

  console.log("!!! MQTT_HOST", MQTT_HOST);
  console.log("!!! MQTT_PORT", MQTT_PORT);
  console.log("!!! WATCH_POLL_TIMEOUT", WATCH_POLL_TIMEOUT);

const poll_interval = WATCH_POLL_TIMEOUT || 10000;
const mosquito_port = process.env.MQTT_PORT || 1883;

const mqttHost = process.env.MQTT_HOST || "localhost";
// const mqttHost = '192.168.1.230';
const url = 'mqtt://' + mqttHost + ':' + mosquito_port + '/mqtt';
console.log("url", url);

const climates = new BuildingClimate.BuildingClimate();
climates.mapHostToRoom("192.168.1.50", "keith", "home/climate/keith");
climates.mapHostToRoom("192.168.1.51", "guest", "home/climate/guest");
climates.mapHostToRoom("192.168.1.52", "bedroom", "home/climate/bedroom");
climates.mapHostToRoom("192.168.1.53", "dining", "home/climate/dining");
climates.mapHostToRoom("192.168.1.54", "irina", "home/climate/irina");
climates.mapHostToRoom("192.168.1.64", "attic", "home/climate/attic"); //
climates.mapHostToRoom("192.168.1.61", "living", "home/climate/living"); //?

const hosts = climates.getHosts();

const mHelper = new mqttHelper.MqttHelper({
    url: url,
    debugTopics: ["home/climate/living", "home/climate/dining"]
});

mHelper.connect();

console.log("mapping", hosts);

// Create a gree client for each host
const clients = hosts.map(host => {
    var opts = {
        host: host,
        debug: false,
        autoConnect: false
        };
    const g = new Gree.Client(opts);
    return g;
});

// Connect to each client then once listen to each message
clients.forEach(client => {
    const thisClient = client;
    client.on('error', (err) => {
        console.log(client.getHost(), "error", err);
    });

    client.connect().then(() => {
        client.on('update', (updatedProperties, properties) => {
            clientUpdate(thisClient.getHost(), updatedProperties, properties);
        }
        );
    });
});

clientUpdate = function(hostName, updatedProperties, properties) {
    // console.log("updated", updatedProperties, "for", hostName);
    const climate = {
        power: properties.power,
        mode: properties.mode,
        currentTemperature: properties.currentTemperature,
        temperature: properties.temperature,
        fanSpeed: properties.fanSpeed,
    };
    // console.log("Update..", hostName, updatedProperties);
    climates.setClimate(hostName, climate);
    const host = climates.getHostData(hostName);
    mHelper.publish(host.topic, JSON.stringify(climate));
}

const web = new WebClient.Web({climates, clients});
web.setup();

setInterval(() => {
    var data = [];
    var hosts = climates.getHosts();
    hosts.map(host => {
        const climate = climates.getClimate(host);
        if (climate) {
            climate.host = host;
            climate.room = climates.getRoom(host);
        } else {
            console.error("No climate for", host);
        }
        data.push(climate);
    });
    console.table(data);
}, poll_interval);
