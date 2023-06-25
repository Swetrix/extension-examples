(async (sdk) => {
  let data = {}
  let pid = null

  sdk.addExportDataRow('As TOML', () => {
    const _data = {
      ...data,
      exportDate: new Date().toString(),
      exportDateISO: new Date().toISOString(),
    }

    const toml = generateTOML(_data, 0)
    const blob = new Blob([toml], { type: 'text/toml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // swetrix-YYYY-MM-DDTHH-mm-ss.toml
    a.download = `swetrix-export-${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.toml`
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

  function generateTOML(obj, indentLevel) {
    let indent = '  '.repeat(indentLevel); // Two spaces per indentation level
    let toml = '';
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        let tableKey = key;
        if (typeof value === 'object') {
          toml += `${indent}[${tableKey}]\n`;
          toml += generateTOML(value, indentLevel + 1);
        } else {
          const _key = /[^a-zA-Z]/.test(key) ? `"${key}"` : key
          const _value = typeof obj[key] === 'number' ? obj[key] : `"${obj[key]}"`

          toml += `${indent}${_key} = ${_value}\n`;
        }
      }
    }
    return toml;
  }
})