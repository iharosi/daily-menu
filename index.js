#!/usr/local/bin/node

'use strict';

require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const path = require('path');
const service = require('./helpers/service');
const providers = {
    bridges: require('./providers/bridges'),
    foodie: require('./providers/foodie')
};
const interval = 1000 * 60 * 60; // 1 hour
const database = [];

/*
 * @param {String} id Restaurant identifier
 */
const getRestaurantName = (id) => {
    let result = database.find((restaurant) => {
        return restaurant.id === id;
    });

    return result && result.name ? result.name : '';
};

const fetchMenus = () => {
    return new Promise((resolve, reject) => {
        Promise.all([
            providers.bridges.fetch(),
            providers.foodie.fetch()
        ]).then((results) => {
            database.push(...results);
            service.log('Restaurant pages has been fetched.');
            resolve(database);
        }).catch(reject);
    });
};

const launchWebService = () => {
    let app = express();
    let port = process.env.PORT || 3000;
    let server;

    app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(morgan('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(bodyParser.json());
    server = app.listen(port, () => {
        service.log(`App now running on port ${server.address().port}`, 'highlight');
    });

    app.get('/restaurant', (request, response) => {
        let result = Object.keys(providers)
            .map((provider) => {
                return {
                    id: provider,
                    name: getRestaurantName(provider)
                };
            });

        response.header('Access-Control-Allow-Origin', '*');
        response.status(200).json(result);
    });

    app.get('/restaurant/:restaurant', (request, response) => {
        let result = database.find((restaurant) => {
            return request.params.restaurant === restaurant.id;
        });

        response.header('Access-Control-Allow-Origin', '*');
        if (result) {
            response.status(200).json(result);
        } else {
            response.status(404).json({
                error: `The restaurant identifier, „${request.params.restaurant}” can not be found.`
            });
        }
    });
};

const init = () => {
    fetchMenus()
        .then(launchWebService)
        .catch((error) => {
            service.exitWithError(error.message, error.code);
        });
    setInterval(fetchMenus, interval);
};

init();
