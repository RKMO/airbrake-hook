import util from 'util';

import config from '../config.js';

function airbrakeUrl({error}) {
  return util.format('https://%s.airbrake.io/projects/%s/groups/%s',
    config.airbrake.org_name,
    error.project.id,
    error.id
  );
}

function formatNotesFromAirbrake(airbrake) {
  return `
Airbrake project: ${airbrake.error.project.name}
Airbrake url: ${airbrakeUrl(airbrake)}

Error class: ${airbrake.error.error_class}
Error message: ${airbrake.error.error_message}
File: ${airbrake.error.file}
Line: ${airbrake.error.line_number}

Environment: ${airbrake.error.environment}
First occurred: ${airbrake.error.first_occurred_at}
Last occurred: ${airbrake.error.last_occurred_at}
Times occurred: ${airbrake.error.times_occurred}

Request method: ${airbrake.error.last_notice.request_method}
Request URL: ${airbrake.error.last_notice.request_url}

Backtrace:
${airbrake.error.last_notice.backtrace.join('\n')}
    `.trim();
}

function formatNameFromAirbrake({error}) {
  return `[${error.project.name}] ${error.error_message} (${error.times_occurred}) [id:${error.id}]`;
}

export {formatNameFromAirbrake, formatNotesFromAirbrake, airbrakeUrl};
