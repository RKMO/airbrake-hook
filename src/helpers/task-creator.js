import {helpers} from '../util/asana';
import {formatNameFromAirbrake, formatNotesFromAirbrake} from './notes-formatter.js';

function createTask(airbrake) {
  const name = formatNameFromAirbrake(airbrake);
  const notes = formatNotesFromAirbrake(airbrake);
  const taskData = {name, notes};

  return helpers.findTaskByAirbrakeErrorId(airbrake.error.id)
    .then((task) => {
      if (task) {
        return helpers.updateTask(task.id, taskData);
      }

      return helpers.createTask(taskData);
    });
}

export {createTask};
