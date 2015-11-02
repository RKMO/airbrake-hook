import bodyParser from 'body-parser';
import express from 'express';
import requestLogger from 'bunyan-request';
import 'source-map-support/register';

import logger from './util/logger';
import {createTask} from './helpers/task-creator.js';
import {incrementAirbrakeStat} from './helpers/send-stats.js';

const app = express();

app.use(bodyParser.json());

app.use(requestLogger({ logger, headerName: 'x-request-id' }));

app.get('/_status', (req, res) => {
  // TODO better health check
  res.status(200).end();
});

app.get('/airbrake', (req, res) => {
  // TODO
  res.status(404).end();
});

app.post('/airbrake', (req, res) => {
  incrementAirbrakeStat(req.body);
  createTask(req.body)
    .then(task => {
      res.status(200).json(task).end();
    })
    .catch(err => {
      res.status(422).json(err).end();
    });
});

export default app;
