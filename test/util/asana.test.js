import {AIRBRAKE_POST_BODY_EXAMPLE} from '../test-helpers.js';
import {helpers} from '../../src/util/asana';
import {formatNameFromAirbrake, formatNotesFromAirbrake} from '../../src/helpers/notes-formatter.js';

describe('asana util', function() {
  this.timeout(0);

  describe('helpers', () => {
    it('me', () => {
      return helpers.me()
        .then(user => {
          expect(user.name).to.exist;
          expect(user.workspaces.length).to.be.gt(0);
        });
    });

    it('projectWorkspace', () => {
      return helpers.projectWorkspace()
        .then(workspace => {
          expect(workspace.id).to.exist;
        });
    });

    it('airbrakeProject', () => {
      return helpers.airbrakeProject()
        .then(project => {
          expect(project.id).to.exist;
        });
    });

    it('allTasksStream', function(done) {
      this.timeout(10000);

      // NOTE this is looking for a real airbrake that exists in asana when
      //      this test was written it may or may not exist in the future
      helpers.allTasksStream().then(stream => {
        stream
          .find(({name}) => {
            return /UndefinedNamespaceException/.test(name);
          })
          .each(({name}) => {
            expect(name).to.match(/UndefinedNamespaceException/);
          })
          .done(done);
      });
    });

    describe('findTaskByAirbrakeErrorId', function() {
      this.timeout(10000);

      it('resolves null when existing task is not found', () => {
        return helpers.findTaskByAirbrakeErrorId('does_not_exist').then(task => {
          expect(task).to.be.nil;
        });
      });

      it('finds an existing task', () => {
        // NOTE this is a real airbrake that exists in asana when this test was written
        //      it may or may not exist in the future
        return helpers.findTaskByAirbrakeErrorId('123456789').then(task => {
          expect(task.name).to.match(/test/);
        });
      });
    });

    it('createSection', () => {
      return helpers.createSection('Testing')
        .then(section => {
          expect(section.name).to.eq('Testing:');
          return section.id;
        })
        .then(sectionId => {
          return [sectionId, helpers.createSection('Testing').get('id')];
        })
        .spread((existingSectionId, sectionId) => {
          expect(sectionId).to.eq(existingSectionId);
        });
    });

    it('createTask & findTaskByNamePattern', () => {
      const airbrakeBody = Object.assign({}, AIRBRAKE_POST_BODY_EXAMPLE);
      const errorId = parseInt(Math.random() * 2147483647, 10);
      airbrakeBody.error.id = errorId;

      const name = formatNameFromAirbrake(airbrakeBody);
      const notes = formatNotesFromAirbrake(airbrakeBody);
      const taskData = {name, notes};

      return helpers.createTask(taskData)
        .tap(task => {
          expect(task.id).to.exist;
          expect(task.name).to.eq(name);
          expect(task.notes).to.eq(notes);
        })
        .then(task => [task, helpers.createSection(airbrakeBody.error.project.name)])
        .spread((task, section) => helpers.addProject(task, section))
        .then(() => helpers.findTaskByAirbrakeErrorId(errorId))
        .tap(task => {
          expect(task.id).to.exist;
          expect(task.name).to.eq(name);
        })
        .then((task) => helpers.getTask(task.id))
        .tap(task => {
          const [{ project, section }] = task.memberships;
          expect(task.memberships).to.be.length(1);
          expect(project.name).to.eq('Airbrakes');
          expect(section.name).to.eq(airbrakeBody.error.project.name + ':');
        });
    });
  });
});
