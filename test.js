var test = require('tape')
var sender = require('.')

test('foo', function (t) {
  t.equal('foo', 'foo')
  t.end()
})

test('bar', function (t) {
  t.equal('bar', 'bar')
  t.end()
})

test('register', function (t) {
  sender.register(function(axol, store) {
    console.log('Generated registration info')
    t.end()
  })
})

test('communicate', function (t) {
  sender.register(function(axolA, storeA) {
    console.log('Generated registration info A')
    sender.register(function(axolB, storeB) {
      console.log('Generated registration info B')

      console.log('\n\nA to B: hello world')
      // TODO: fail happens here
      var enc = axolA.encryptMessage('bob', toBytes('hello world')).then(function (result) {
        console.log(result)

        console.log('\n\nB to A: yolo')

        console.log('\n\nA to B: swag')

        t.end()
      })
    })
  })
})

function toBytes(str) {
  var ret = new Uint8Array(str.length)
  for (var i = 0; i < ret.length; i++) {
    if (str.charCodeAt(i) > 255) {
      throw new Error('Expected ASCII')
    }
    ret[i] = str.charCodeAt(i)
  }
}
