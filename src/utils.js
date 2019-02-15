const fs = require('fs-extra')
const path = require('path')
const glob = require('fast-glob')
const mkdirp = require('mkdirp')
const get = require('dash-get').default
const rgbHex = require('rgb-hex')

const here = dest => path.resolve(__dirname, dest)
const there = dest => path.resolve(process.cwd(), dest)

const prepareWrite = dest => {
  const dir = path.dirname(dest)
  mkdirp.sync(dir)
}

const readFileDirect = async dest => fs.readFile(dest, 'utf-8')
const readFile = async dest => readFileDirect(here(dest))
const readClientFile = async dest => readFileDirect(there(dest))

const writeFile = async (dest, content) => {
  prepareWrite(here(dest))
  return fs.writeFile(here(dest), content)
}

const writeClientFile = async (dest, content) => {
  prepareWrite(there(dest))
  return fs.writeFile(there(dest), content)
}

const getSketchJsonPaths = async () => {
  const paths = await glob([
    there('./sketch-json/**/document.json'),
    there('./sketch-json/document.json'),
  ])

  return paths || []
}

const getPageFromFiles = async files => {
  let page = null

  for (let i = 0, len = files.length; i < len; i++) {
    const file = files[i]
    const content = await readFileDirect(file)
    const matches = content.match(
      /\"name\"\:\ \"Swatch\"|\"name\"\:\"Swatch\"/g,
    )
    if (matches) {
      page = JSON.parse(content)
      break
    }
  }

  return page
}

const mapPageToLayers = async page => {
  const { layers } = page

  return layers
    .map(layer => {
      const { name } = layer
      const styles = layer.layers.find(l => l.style)
      const fill = getFillFromLayerStyles(styles)

      if (!fill) return null

      return {
        name: name.replace('Colors/', ''),
        hex: convertFillToHex(fill),
      }
    })
    .filter(l => !l.name.includes('_Default'))
    .filter(l => l)
}

const getFillFromLayerStyles = styles => {
  const style = get(styles, 'style', [])
  const fills = get(style, 'fills', [])
  const fill = fills[0] || {}
  return get(fill, 'color')
}

const convertFillToHex = fill => {
  const { red, green, blue } = fill
  const r = 255 * red
  const g = 255 * green
  const b = 255 * blue

  return `#${rgbHex(r, g, b).toUpperCase()}`
}

const createSchemaFromLayers = layers => {
  return Object.keys(layers).reduce((scheme, key) => {
    const layer = layers[key]
    const [color, shade] = layer.name.split('/')
    if (!scheme[color]) {
      scheme[color] = {}
    }
    scheme[color][shade] = layer.hex

    return scheme
  }, {})
}

module.exports = {
  convertFillToHex,
  createSchemaFromLayers,
  getFillFromLayerStyles,
  getPageFromFiles,
  getSketchJsonPaths,
  here,
  there,
  mapPageToLayers,
  readFile,
  readClientFile,
  writeFile,
  writeClientFile,
}
