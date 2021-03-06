import bodyParser from 'body-parser';
import express from 'express';
import requestLogger from 'bunyan-request';
import 'source-map-support/register';

import logger from './util/logger';
import {createTask} from './helpers/task-creator.js';

const app = express();

app.use(bodyParser.json());

const requestLogMiddleware = requestLogger({ logger, headerName: 'x-request-id' });

app.get('/_status', (req, res) => {
  // TODO better health check
  res.status(200).end();
});

app.get('/airbrake', requestLogMiddleware, (req, res) => {
  // TODO
  res.status(404).end();
});

app.post('/airbrake', requestLogMiddleware, (req, res) => {
  createTask(req.body)
    .then(task => {
      res.status(200).json(task).end();
    })
    .catch(err => {
      res.status(422).json(err).end();
    });
});

export default app;
