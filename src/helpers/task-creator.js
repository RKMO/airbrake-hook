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

  return helpers.findTaskByAirbrakeErrorId(airbrake.error.id)
    .then((task) => {
      if (task) {
        return helpers.updateTask(task.id, taskData);
      }

      return helpers.createTask(taskData);
    })
    .tap(task => {
      return helpers.createSection(airbrake.error.project.name)
        .tap(section => helpers.addProject(task, section));
    });
}

export {createTask};
