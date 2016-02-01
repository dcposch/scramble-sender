global['prettyPrint'] = prettyPrint
function prettyPrint (obj, level) {
  if (typeof obj !== 'object' || obj === undefined || obj === null) {
    return '' + JSON.stringify(obj)
  }
  if (obj instanceof ArrayBuffer) {
    if (obj.length === 0) return 'ArrayBuffer(0)'
    return new Buffer(obj).toString('hex')
  }
  if (Array.isArray(obj) && obj.length === 0) {
    return '[]'
  }
  if (Object.keys(obj).length === 0) {
    return '{}'
  }

  var nextLevel = (level || 0) + 1
  var newline = '\n' + new Array(nextLevel).join('  ')
  // works for both objects and arrays
  var lines = Object.keys(obj).map(function (key) {
    var val = obj[key]
    return key + ': ' + prettyPrint(val, nextLevel)
  })
  return newline + lines.join(newline)
}

module.exports = prettyPrint
