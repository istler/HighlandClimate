
//const Gree = require ('../../src/client.js');
require('source-map-support').install();
const Gree = require ('gree-hvac-client');
const BuildingClimate = require ('./building-climate.js');
const WebClient = require('./web.js');
const mqttHelper = require('./mqtt-helper.js');

const mqttHost = 'localhost';
// const mqttHost = '192.168.1.230';
const url = 'mqtt://' + mqttHost + ':1883/mqtt';
console.log("url", url);

const climates = new BuildingClimate.BuildingClimate();
climates.mapHostToRoom("192.168.1.50", "keith", "home/climate/keith");
climates.mapHostToRoom("192.168.1.51", "guest", "home/climate/guest");
climates.mapHostToRoom("192.168.1.52", "bedroom", "home/climate/bedroom");
climates.mapHostToRoom("192.168.1.53", "dining", "home/climate/dining");
climates.mapHostToRoom("192.168.1.54", "irina", "home/climate/irina");
// climates.mapHostToRoom("192.168.1.58", "living", "home/climate/living"); //?
climates.mapHostToRoom("192.168.1.64", "attic", "home/climate/attic"); //

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
    //console.log("updated", updatedProperties, "for", hostName);
    const climate = {
        power: properties.power,
        mode: properties.mode,
        currentTemperature: properties.currentTemperature,
        temperature: properties.temperature,
        fanSpeed: properties.fanSpeed,
    };
    // console.log("Update..", updatedProperties);
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
        } else {
            console.error("No climate for", host);
        }
        data.push(climate);
    });
    console.table(data);
}, 60000);
