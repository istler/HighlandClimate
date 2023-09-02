const Gree = require('@istler/gree-hvac-client');
const express = require('express');
const bodyParser = require("body-parser");
var path = require('path');


class Web {

    constructor(options = {}) {

        /*
         * Client options
         *
         * @type {CLIENT_OPTIONS}
         * @private
         */
        this._options = {...options };
        this._store = {};
    }

    setup() {
        this.router = express();
        console.log('Web setup');
        this.router.get('/hosts/', (req, res) => {
            var data = [];
            var hosts = this._options.climates.getHosts();
            hosts.map(host => {
                const climate = this._options.climates.getClimate(host);
                climate.host = host;
                climate.room = this._options.climates.getRoom(host);
                data.push(climate);
            });
            res.json(data);
        });

        this.router.get('/light/on/:host', (req, res) => {
            console.log('Web Light - on', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('light on', thisClient._options.host);
                    thisClient.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.on);
                }
            });
            res.json({
                success: req.params.host
            });
        });

        this.router.get('/light/off/:host', (req, res) => {
            console.log('Web Light - off', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('light off', thisClient._options.host);
                    thisClient.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.off);
                }
            });
            res.json({
                success: req.params.host
            });
        });

        // add route to turn on cool air
        this.router.get('/cool/:host', (req, res) => {
            console.log('Web Cool', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('cool air', thisClient._options.host);
                    const properties = {
                        power: Gree.VALUE.power.on,
                        mode: Gree.VALUE.mode.cool,
                        fanSpeed: Gree.VALUE.fanSpeed.auto,
                        temperature: 22
                    };
                    thisClient.setProperties(properties)
                    .catch(error => console.error(error));
                }
            });
            res.json({
                success: req.params.host
            });
        });

        // add route to turn on heat air
        this.router.get('/heat/:host', (req, res) => {
            console.log('Web Heat', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('heat air', thisClient._options.host);
                    thisClient.setProperty(Gree.PROPERTY.power, Gree.VALUE.power.on);
                    thisClient.setProperty(Gree.PROPERTY.mode, Gree.VALUE.mode.heat);
                    thisClient.setProperty(Gree.PROPERTY.fanSpeed, Gree.VALUE.fanSpeed.auto);
                    thisClient.setProperty(Gree.PROPERTY.temperature, 23);
                }
            });
            res.json({
                success: req.params.host
            });
        });

        this.router.get('/fan/:host', (req, res) => {
            console.log('Web Fan', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('fan', thisClient._options.host);
                    const properties = {
                        power: Gree.VALUE.power.on,
                        mode: Gree.VALUE.mode.fan_only,
                        fanSpeed: Gree.VALUE.fanSpeed.mediumHigh
                    };
                    thisClient.setProperties(properties)
                    .catch(error => console.error(error));
                }
            });
            res.json({
                success: req.params.host
            });
        });

        this.router.get('*', (req, res) => {
            console.log(req.method, req.originalUrl);

            var file = "index.htm";
            if (req.originalUrl != "/") {
                file = req.originalUrl;
            }
            console.log("getting", file);
            res.sendFile(path.resolve("static/" + file));
        });


        this.router.get('/user/:id', (req, res) => {
           res.send(req.params);
        });

        this.router.listen(4000, () => {
            console.log('Web is running');
        });

        this.router.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke! ' + req.originalUrl + " :: " + err.stack);
          });

        // this.router.use(express.static(__dirname + "/static"));
        this.router.use(bodyParser.urlencoded({ extended: true }))
    }

};

module.exports = {
    Web
};