
//const Gree = require ('../../src/client.js');
const Gree = require ('gree-hvac-client');

const BuildingClimate = require ('./building-climate.js');

const mqttHelper = require('./mqtt-helper.js');
const mqttHost = 'localhost';
const url = 'mqtt://' + mqttHost + ':1883/mqtt';
console.log("url", url);

const climates = new BuildingClimate.BuildingClimate();
climates.mapHostToRoom("10.0.0.2", "keith", "home/climate/keith");      // 2
climates.mapHostToRoom("10.0.0.96", "living", "home/climate/living");   // 1
climates.mapHostToRoom("10.0.0.103", "bedroom", "home/climate/bedroom");// 2
climates.mapHostToRoom("10.0.0.143", "irina", "home/climate/irina");    // 2
climates.mapHostToRoom("10.0.0.173", "dining", "home/climate/dining");  // 1
climates.mapHostToRoom("10.0.0.198", "guest", "home/climate/guest");    // 2
climates.mapHostToRoom("10.0.0.200", "attic", "home/climate/attic");    // 3

const hosts = climates.getHosts();

const mHelper = new mqttHelper.MqttHelper({
    url: url,
    debugTopics: ["home/climate/test1", "home/climate/test2"]
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

    climates.setClimate(hostName, climate);
    const host = climates.getHostData(hostName);
    mHelper.publish(host.topic, JSON.stringify(climate));
}

const Web = require('./web.js');
const web = new Web.Web({climates});
web.setup();


setInterval(() => {
    var data = [];
    var hosts = climates.getHosts();
    hosts.map(host => {
        const climate = climates.getClimate(host);
        climate.host = host;
        data.push(climate);
    });
    console.table(data);
}, 30000);
