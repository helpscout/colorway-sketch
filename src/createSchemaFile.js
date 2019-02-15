const { extract } = require('./extract')
const { cleanUp } = require('./cleanUp')

exports.createSchemaFile = async () => {
  try {
    console.log('')
    console.log('🎨', '', 'Colorway Sketch')
    console.log('')
    console.log('Looking for sketch files...')

    await extract()
    await cleanUp()

    console.log('')
    console.log('Colorway sketch complete!')
    console.log('Have a great day!')
    process.exit(0)
  } catch (err) {
    console.log('Hmm! No sketch files found.')
    process.exit(0)
  }
}
