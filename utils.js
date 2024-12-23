const core = require('@actions/core')
const BuildSizeEvent = require('./BuildSizeEvent')

const analysisFileUrl = core.getInput('analysis-file-url')
const analysisFileContents = core.getInput('analysis-file-contents')

async function getFileContentsAsJson() {
    if (analysisFileContents) {
        console.log("Using analysis file contents")
        return JSON.parse(analysisFileContents)
    } else if (analysisFileUrl) {
        console.log('Fetching analysis file from', analysisFileUrl)
        return await fetch(analysisFileUrl).then((r) => r.json())
    } else throw new Error('No analysis file provided. Must provide one of "analysis-file-contents" or "analysis-file-url"')
}


function createEvents(analysisFileContentsJson) {
    const objectsToReport = []

    const shouldTraverse = JSON.parse(core.getInput('traverse'))

    const fileFilter = core.getInput('file-name-filter')
    const fileFilterFn = (asset) => fileFilter ? asset.label.includes(fileFilter) : true
    analysisFileContentsJson.filter(fileFilterFn).forEach((asset => parseAsset(asset, undefined)))

    return objectsToReport

    function parseAsset(asset, entry) {
        const { entryPoint } = objectsToReport.push(new BuildSizeEvent(asset, entry))
        if (shouldTraverse && asset.groups) {
            asset.groups.forEach((group) => {
                parseAsset(group, entryPoint)
            })
        }
    }
}

async function reportEvents(objectsToReport) {
        const env = core.getInput('nr-env')
        let envDomain = ''
        switch (env) {
            case 'US':
                envDomain = 'https://insights-collector.newrelic.com'
                break
            case 'EU':
                envDomain = 'https://insights-collector.eu.newrelic.net'
                break
            case 'staging':
                envDomain = 'https://staging-insights-collector.newrelic.com'
                break
            default:
                throw new Error('Invalid NR environment')
        }
        
        console.log(`Reporting ${objectsToReport.length} "${core.getInput('event-type')}" events to ${envDomain}/v1/accounts/${core.getInput('nr-account-id')}/events`)

        return await fetch(`${envDomain}/v1/accounts/${core.getInput('nr-account-id')}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': core.getInput('nr-api-key')
            },
            body: JSON.stringify(objectsToReport)
        })
            .then((r) => r.json())
}

module.exports = {
    getFileContentsAsJson,
    createEvents,
    reportEvents
}