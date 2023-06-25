(async (sdk) => {
  let data = {}
  let pid = null

  sdk.addExportDataRow('As YAML', () => {
    const _data = {
      ...data,
      exportDate: new Date().toString(),
      exportDateISO: new Date().toISOString(),
    }

    const yaml = generateYAML(_data, 0)
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // swetrix-YYYY-MM-DDTHH-mm-ss.yaml
    a.download = `swetrix-export-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.yaml`
    a.click()
  })

  sdk.addEventListener('projectinfo', ({ id }) => {
    pid = id
  })

  sdk.addEventListener('load', ({ period, timeBucket, from, to, params, filters, customs }) => {
    data = {
      period,
      timeBucket,
      from,
      to,
      data: params,
      filters,
      customs,
    }
  })

  function generateYAML(obj, indentLevel) {
    let indent = '  '.repeat(indentLevel) // Two spaces per indentation level
    let yaml = ''
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // 1. If the key is longer than 1024 characters, truncate it
        // 2. Replace all '' with "" and encapsulate the whole key in ''
        let _key = key
          .replace(/^(.{1022}).+/, '$1') // 1 (1022 + '')
          .replace(/'/g, '"') // 2
        
        _key = `'${_key}'`

        yaml += `${indent}${_key}: `
        if (typeof obj[key] === 'object') {
          yaml += '\n'
          yaml += generateYAML(obj[key], indentLevel + 1)
        } else {
          yaml += `${obj[key]}\n`
        }
      }
    }
    return yaml
  }
})