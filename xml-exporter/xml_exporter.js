(async (sdk) => {
  let data = {}
  let pid = null

  sdk.addExportDataRow('As XML', () => {
    const _data = {
      ...data,
      exportDate: new Date().toString(),
      exportDateISO: new Date().toISOString(),
    }

    const xml = generateXML(_data)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // swetrix-YYYY-MM-DDTHH-mm-ss.xml
    a.download = `swetrix-export-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.xml`
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

  function generateXML(obj) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<data>\n'
    xml += generateXMLNode(obj, 1)
    xml += '</data>'
    return xml
  }

  function generateXMLNode(obj, indentLevel) {
    let indent = '\t'.repeat(indentLevel)
    let xml = ''
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // 1. Replace all incorrect characters with underscores
        // 2. If the key starts with a number, prepend it with an underscore
        // 3. If the key starts with 'XML' (or any other case), prepend it with an underscore (e.g. _xml)
        // 4. If the key is empty, replace it with _
        const _key = key
          .replace(/[^a-zA-Z0-9_]/g, '_') // 1
          .replace(/^(\d)/, '_$1') // 2
          .replace(/^XML/i, '_XML') // 3
          .replace(/^$/, '_') // 4

        if (typeof obj[key] === 'object') {
          xml += `${indent}<${_key}>\n`
          xml += generateXMLNode(obj[key], indentLevel + 1)
          xml += `${indent}</${_key}>\n`
        } else {
          xml += `${indent}<${_key}>${obj[key]}</${_key}>\n`
        }
      }
    }
    return xml
  }
})