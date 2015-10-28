module.exports = {
  server: {
    port: 3020,
  },
  airbrake: {
    api_key: process.env.AIRBRAKE_KEY,
    org_name: process.env.AIRBRAKE_ORG_NAME,
  },
  logger: {
    name: 'airbrake-hook',
    stream: process.stderr,
    level: 'info',
    src: !!process.env.LOGGER_SRC,
  },
  asana: {
    access_token: process.env.ASANA_ACCESS_TOKEN,
    project_workspace_id: process.env.ASANA_PROJECT_WORKSPACE_ID,
    airbrake_project_id: process.env.ASANA_AIRBRAKE_PROJECT_ID,
  },
};
