const core = require('@actions/core');
const github = require('@actions/github');

try {

    const analysisFile = core.getInput('analysis-file');
    const nrApiKey = core.getInput('nr-api-key');
    const nrAccountId = core.getInput('nr-account-id');
    const traverse = require('traverse');

    console.log(`Analysis file: ${analysisFile}`);
    console.log(`New Relic API key: ${nrApiKey}`);
    console.log(`New Relic account ID: ${nrAccountId}`);
    console.log(`traverse: ${traverse}`);   


//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput('analysis-file');
//   console.log(`Hello ${nameToGreet}!`);
//   const time = (new Date()).toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2)
//   console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}