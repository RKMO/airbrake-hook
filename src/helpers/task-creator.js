import logger from '../util/logger';
import {helpers} from '../util/asana';
import {formatNameFromAirbrake, formatNotesFromAirbrake} from './notes-formatter.js';

function createTask(airbrake) {
  const name = formatNameFromAirbrake(airbrake);
  const notes = formatNotesFromAirbrake(airbrake);
  const taskData = {
    name,
    notes,
    completed: false,
  };

  const airbrakeErrorId = airbrake.error.id;
  logger.info({airbrakeErrorId}, 'looking for task by airbrake error id');

  return helpers.findTaskByAirbrakeErrorId(airbrakeErrorId)
    .then((task) => {
      if (task) {
        logger.info({airbrakeErrorId, asanaTaskId: task.id}, 'existing task found, updating task...');
        return helpers.updateTask(task.id, taskData);
      }

      logger.info({airbrakeErrorId}, 'existing task not found, creating a new task...');
      return helpers.createTask(taskData);
    })
    .tap(task => {
      logger.info({airbrakeErrorId, task}, 'task created/updated');
      return helpers.createSection(airbrake.error.project.name)
        .tap(section => helpers.addProject(task, section));
    })
    .catch(err => {
      logger.error({airbrakeErrorId, err}, 'error in createTask');
      throw err;
    });
}

export {createTask};
