const express = require('express');

class Web {

    constructor(options = {}) {

        /**
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

        this.router.get('/', (req, res) => {
            console.log('Web get', req.url);
            var data = [];
            var hosts = this._options.climates.getHosts();
            hosts.map(host => {
                const climate = this._options.climates.getClimate(host);
                climate.host = host;
                data.push(climate);
            });
            res.json(data);

        });

        this.router.get('/user/:id', (req, res) => {
           res.send(req.params);
        });

        this.router.listen(3000, () => {
            console.log('Web is running');
        });
    }

};

module.exports = {
    Web
};