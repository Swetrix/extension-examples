(async (sdk) => {
  function convertCustomsToTree(obj, separator) {
    const result = {}
  
    for (const key in obj) {
      let currentNode = result
  
      const parts = key.split(separator)
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isLastPart = i === parts.length - 1
  
        if (!currentNode[part]) {
          if (isLastPart) {
            currentNode[part] = obj[key]
          } else {
            currentNode[part] = {}
            currentNode = currentNode[part]
          }
        } else if (typeof currentNode[part] !== 'object') {
          currentNode[part] = { _: currentNode[part] }
          if (isLastPart) {
            currentNode[part]._ = obj[key]
          } else {
            currentNode[part][parts[i + 1]] = obj[key]
          }
        } else {
          currentNode = currentNode[part]
        }
      }
    }
  
    return result
  }

  function convertTreeToHTML(tree, nested) {
    let html = `<ul ${nested ? 'class="nested"' : ''} id="customs_tree">`
  
    for (const key in tree) {
      const value = tree[key]
  
      if (typeof value === 'object') {
        html += `<li><span class="caret">${key}</span>`
        html += convertTreeToHTML(value, true)
        html += '</li>'
      } else {
        html += `<li>${key}: ${value}</li>`
      }
    }
  
    html += '</ul>'
    return html
  }

  const generateHTML = (customs, theme) => {
    const tree = convertCustomsToTree(customs, '__')
    const treeHTML = convertTreeToHTML(tree)
    const styles = `
      ul, #customs_tree {
        list-style-type: none;
        color: ${theme === 'dark' ? 'white' : 'black'};
      }

      #customs_tree {
        margin: 0;
        padding: 0;
      }

      .caret {
        cursor: pointer;
        -webkit-user-select: none; /* Safari 3.1+ */
        -moz-user-select: none; /* Firefox 2+ */
        -ms-user-select: none; /* IE 10+ */
        user-select: none;
      }

      .caret::before {
        content: "\\25B4";
        color: ${theme === 'dark' ? 'white' : 'black'};
        display: inline-block;
        margin-right: 6px;
        -ms-transform: rotate(90deg); /* IE 9 */
        -webkit-transform: rotate(90deg); /* Safari */'
        transform: rotate(90deg);  
      }

      .caret-down::before {
        -ms-transform: rotate(180deg); /* IE 9 */
        -webkit-transform: rotate(180deg); /* Safari */'
        transform: rotate(180deg);  
      }

      .nested {
        display: none;
      }

      .ce-active {
        display: block;
      }

      .ce-active > li {
        margin-left: 20px;
      }
    `

    const script = `
      var toggler = document.getElementsByClassName("caret")

      for (let i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", function() {
          this.parentElement.querySelector(".nested").classList.toggle("ce-active")
          this.classList.toggle("caret-down")
        });
      }
    `

    return `
      ${treeHTML}
      <style>${styles}</style>
      <script>${script}</script>
    `
  }

  let html = ''
  let theme = null // 'dark' | 'light'
  let customs = {}

  const renderCustoms = () => {
    if (!theme || Object.keys(customs).length === 0) {
      return
    }

    html = generateHTML(customs, theme)
    sdk.updatePanelTab('ce', html)
  }

  sdk.addPanelTab('ce', html)

  sdk.addEventListener('clientinfo', ({ theme: _theme }) => {
    theme = _theme
    renderCustoms()
  })

  sdk.addEventListener('load', ({ customs: _customs }) => {
    customs = _customs
    renderCustoms()
  })
})