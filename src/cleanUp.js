const fs = require('fs-extra')
const path = require('path')
const glob = require('fast-glob')
const { there } = require('./utils')

const removeZipFile = async sketchFile => {
  const srcDir = path.dirname(sketchFile)
  const fileName = path.basename(sketchFile)
  const zipFileName = fileName.replace('.sketch', '.zip')
  const zipFile = path.join(srcDir, zipFileName)

  if (fs.existsSync(zipFile)) {
    await fs.remove(zipFile)
  }
}

exports.cleanUp = async () => {
  try {
    console.log('Cleaning up...')
    const sketchJsonDir = there('./sketch-json')
    const sketchFiles = await glob(there('./**/*.sketch'))
    const tasks = []

    if (fs.existsSync(sketchJsonDir)) {
      tasks.push(fs.remove(sketchJsonDir))
    }

    if (sketchFiles) {
      sketchFiles.forEach(sketchFile => {
        tasks.push(removeZipFile(sketchFile))
      })
    }

    await Promise.all(tasks)

    return Promise.resolve()
  } catch (err) {
    throw err
  }
}
