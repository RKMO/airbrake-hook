import _ from 'highland';
import asana from 'asana';
import Promise from 'bluebird';
import {memoize, merge} from 'lodash';

import config from '../config';
import logger from '../util/logger.js';

const client = asana.Client.create().useAccessToken(config.asana.access_token);

function me() {
  return client.users.me();
}

const projectWorkspaceId = config.asana.project_workspace_id;
const airbrakeProjectId = config.asana.airbrake_project_id;

const projectWorkspace = memoize(() => {
  return client.workspaces.findById(projectWorkspaceId);
});

const sectionCache = new Map();

function createTask(taskData = {}) {
  const defaultTaskData = {
    projects: [airbrakeProjectId],
  };

  const updatedTaskData = merge({}, defaultTaskData, taskData);

  return client.tasks.createInWorkspace(projectWorkspaceId, updatedTaskData)
    .tap(task => {
      logger.info({task}, 'task created');
    });
}

function updateTask(taskId, taskData) {
  return client.tasks.update(taskId, taskData);
}

function addProject(task, section) {
  const data = {
    project: airbrakeProjectId,
    section: section.id,
  };
  return client.tasks.addProject(task.id, data);
}

function airbrakeProject() {
  return client.projects.findById(airbrakeProjectId);
}

function findByProject() {
  return client.tasks.findByProject(airbrakeProjectId);
}

function allTasks() {
  return findByProject().get('data');
}

function allTasksStream() {
  return findByProject()
    .then(collection => {
      let lastPage = collection;

      return _((push, next) => {
        if (!lastPage) {
          push(null, _.nil);
          return;
        }

        lastPage.data.forEach(task => push(null, task));

        lastPage.nextPage().then(page => {
          lastPage = page;
          next();
        });
      });
    });
}

function getTask(taskId) {
  return client.tasks.findById(taskId);
}

function findTasksBy(key, query) {
  return allTasksStream().then(stream => {
    let foundTask = null
    return new Promise((resolve, reject) => {
      stream.find(task => {
        if (query instanceof RegExp) {
          return query.test(task[key]);
        }

        return task[key] === query;
      }).each((task) => {
        logger.info({task, key, query}, `found task`);
        foundTask = task;
      }).done(() => {
        resolve([foundTask]);
      });
    });
  });
}

function findTaskByAirbrakeErrorId(errorId) {
  return findTasksBy('name', new RegExp(`\\[id:${errorId}\\]`))
    .get(0);
}

function createSection(name) {
  const cachedSection = sectionCache.get(name);
  if (cachedSection) {
    return Promise.resolve(cachedSection);
  }

  const taskData = { name: name + ':' };
  return findTasksBy('name', taskData.name)
    .then(([section]) => {
      if (section) return section;
      return createTask(taskData);
    })
    .tap(section => {
      sectionCache.set(name, section);
    });
}

const helpers = {
  me,
  projectWorkspace,
  createTask,
  updateTask,
  addProject,
  airbrakeProject,
  findByProject,
  allTasks,
  allTasksStream,
  getTask,
  findTasksBy,
  findTaskByAirbrakeErrorId,
  createSection,
};

export default client;
export {helpers};
