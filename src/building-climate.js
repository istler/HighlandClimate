'use strict';

/**
 * Track temperature in a room
 * Each host is mapped to a room, topic and climate
 */
class BuildingClimate {

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
    
    /**
     * Each host is mapped to a room, topic for initial setup
     * 
     * @param {string} host ip address of host
     * @param {string} room name of room
     * @param {string} topic mqtt topic
     */
    mapHostToRoom(host, room, topic) {
        this._store[host] = { room, topic };
        console.log(this._store[host]);
    }

    setClimate(host, climate) {
        this._store[host].climate = climate;
    }

    /**
     * 
     * @param {object} host may contain room, topic and climate 
     * @returns 
     */
    getHostData(host) {
        return this._store[host];
    }

    getHosts() {
        return Object.keys(this._store);
    }

    getRooms() {
        return Object.values(this._store).map(climate => climate.room);
    }

    getRoom(host) {
        const wrappers = Object.values(this._store).filter(wrapper => {
            // console.log("wrapper.climate.host", wrapper.climate.host, "host", host);
            if (wrapper.climate) {
                return wrapper.climate.host == host;
            } else {
                return false;
            }
        });
        const rooms = Object.values(wrappers).map(wrapper => wrapper.room);
        if (rooms.length == 0 ) {
            return null;
        } else if (rooms.length == 1 ) {
            return rooms[0];
        }
        return rooms.join(",");
    }

    getClimate(host) {
        return this._store[host].climate;
    }

    getFilteredRooms(filter) {
        return Object.keys(this._store).filter(filter);
    }

}

module.exports = {
    BuildingClimate
};