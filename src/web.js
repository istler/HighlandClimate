const Gree = require('gree-hvac-client');
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

        this.router.get('*', (req, res) => {
            console.log(req.method, req.originalUrl);

            var file = "index.htm";
            if (req.originalUrl != "/") {
                file = req.originalUrl;
            }
            console.log("getting", file);
            res.sendFile(path.resolve("static/" + file));
        });

        // add route to turn on cool air
        this.router.get('/cool/:host', (req, res) => {a
            console.log('Web Cool', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('cool air', thisClient._options.host);
                    thisClient.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.on);
                    // thisClient.setProperty(Gree.PROPERTY.mode, Gree.VALUE.mode.cool);
                }
            });
            res.json({
                success: req.params.host
            });
        });

        this.router.get('/fan/:host', (req, res) => {
            console.log('Web Cool', req.url);
            this._options.clients.forEach(client => {
                const thisClient = client;
                if (req.params.host && req.params.host == client._options.host) {
                    console.log('fan', thisClient._options.host);
                    thisClient.setProperty(Gree.PROPERTY.cool, Gree.VALUE.mode.fan_only);
                }
            });
            res.json({
                success: req.params.host
            });
        });

        this.router.get('/user/:id', (req, res) => {
           res.send(req.params);
        });

        this.router.listen(3000, () => {
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