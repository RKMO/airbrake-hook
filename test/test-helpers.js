import chai from 'chai';
import fs from 'fs';
import path from 'path';
import request from 'supertest';

import app from '../src/app.js';

const agent = request.agent(app);

global.expect = chai.expect;

const AIRBRAKE_POST_BODY_EXAMPLE = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../example.json')));

export default {
  agent,
  AIRBRAKE_POST_BODY_EXAMPLE,
};
