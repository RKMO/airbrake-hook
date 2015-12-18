/* eslint quotes: [2, "single", "avoid-escape"] */

import {agent, AIRBRAKE_POST_BODY_EXAMPLE} from './test-helpers.js';
import {helpers} from '../src/util/asana.js';

describe('Routes', function() {
  this.timeout(0);

  describe('POST /airbrake', () => {
    const airbrakeBody = Object.assign({}, AIRBRAKE_POST_BODY_EXAMPLE);
    const errorId = parseInt(Math.random() * 2147483647, 10);
    airbrakeBody.error.id = errorId;

    let createdTask = null;

    it('creates a new asana task', (done) => {
      agent
        .post('/airbrake')
        .send(airbrakeBody)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;

          expect(res.body.id).to.exist;
          expect(res.body.name).to.exist;

          return helpers.findTaskByAirbrakeErrorId(errorId)
            .then((task) => {
              expect(task).to.exist;
              expect(task.id).to.exist;
              expect(task.name).to.contain(airbrakeBody.error.error_message);
              expect(task.name).to.contain(airbrakeBody.error.id);

              createdTask = task;
              done();
            });
        });
    });

    // this test depends on the above test running :/
    it('updates an existing asana task', (done) => {
      const updatedAirbrake = Object.assign({}, airbrakeBody);

      agent
        .post('/airbrake')
        .send(updatedAirbrake)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;

          expect(res.body.id).to.eq(createdTask.id);

          return helpers.findTaskByAirbrakeErrorId(errorId)
            .then((task) => {
              expect(task).to.exist;
              expect(task.id).to.eq(createdTask.id);
              expect(task.name).to.contain(airbrakeBody.error.id);

              done();
            });
        });
    });
  });
});
