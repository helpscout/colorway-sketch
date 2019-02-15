const fs = require('fs-extra')
const path = require('path')
const glob = require('fast-glob')
const sketchJson = require('sketch-json')
const { cleanUp } = require('./cleanUp')
const {
  there,
  getPageFromFiles,
  mapPageToLayers,
  getSketchJsonPaths,
  createSchemaFromLayers,
  writeClientFile,
} = require('./utils')

const generateSchema = async jsonPath => {
  console.log(`Examining ${jsonPath}...`)
  const srcDir = path.dirname(jsonPath)
  const target = path.join(srcDir, 'pages/*.json')
  const files = await glob(target)

  const page = await getPageFromFiles(files)
  const layers = await mapPageToLayers(page)

  const schema = createSchemaFromLayers(layers)
  if (schema) {
    console.log('Color scheme found!')
    console.log('Generating color scheme JSON...')
  }
  await writeClientFile('./data/colors.json', JSON.stringify(schema, null, 2))
  console.log(`Generated ${there('./data/colors.json')}`)
}

const generateSchemas = async () => {
  if (!fs.existsSync(there('./sketch-json'))) {
    console.log('Hmm! Could not find any sketch files')
    process.exit(0)
  }

  console.log('')
  console.log('Found sketch files!')
  console.log('Extracting colors from Sketch...')

  try {
    const jsonPaths = await getSketchJsonPaths()
    const tasks = []
    jsonPaths.forEach(jsonPath => {
      tasks.push(generateSchema(jsonPath))
    })

    await Promise.all(tasks)
  } catch (err) {
    throw err
  }
}

exports.extract = async () => {
  try {
    if (fs.existsSync(there('./sketch-json'))) {
      await cleanUp()
    }
    await sketchJson.toJson()
    return generateSchemas()
  } catch (err) {
    throw err
  }
}
