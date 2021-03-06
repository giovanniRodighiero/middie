'use strict'

const middie = require('./middie')
const t = require('tap')
const test = t.test

test('use no function', t => {
  t.plan(3)

  const instance = middie(function (err, a, b) {
    t.error(err)
    t.equal(a, req)
    t.equal(b, res)
  })

  const req = {
    url: '/test'
  }
  const res = {}

  instance.run(req, res)
})

test('use a function', t => {
  t.plan(5)

  const instance = middie(function (err, a, b) {
    t.error(err)
    t.equal(a, req)
    t.equal(b, res)
  })
  const req = {
    url: '/test'
  }
  const res = {}

  t.equal(instance.use(function (req, res, next) {
    t.pass('function called')
    next()
  }), instance)

  instance.run(req, res)
})

test('use two functions', t => {
  t.plan(5)

  const instance = middie(function (err, a, b) {
    t.error(err)
    t.equal(a, req)
    t.equal(b, res)
  })
  const req = {
    url: '/test'
  }
  const res = {}
  var counter = 0

  instance.use(function (req, res, next) {
    t.is(counter++, 0, 'first function called')
    next()
  }).use(function (req, res, next) {
    t.is(counter++, 1, 'second function called')
    next()
  })

  instance.run(req, res)
})

test('stop the middleware chain if one errors', t => {
  t.plan(1)

  const instance = middie(function (err, a, b) {
    t.ok(err, 'error is forwarded')
  })
  const req = {
    url: '/test'
  }
  const res = {}

  instance.use(function (req, res, next) {
    next(new Error('kaboom'))
  }).use(function (req, res, next) {
    t.fail('this should never be called')
    next()
  })

  instance.run(req, res)
})

test('run restricted by path', t => {
  t.plan(9)

  const instance = middie(function (err, a, b) {
    t.error(err)
    t.equal(a, req)
    t.equal('/test', req.url)
    t.equal(b, res)
  })
  const req = {
    url: '/test'
  }
  const res = {}

  t.equal(instance.use(function (req, res, next) {
    t.ok('function called')
    next()
  }), instance)

  t.equal(instance.use('/test', function (req, res, next) {
    t.ok('function called')
    next()
  }), instance)

  t.equal(instance.use('/no-call', function (req, res, next) {
    t.fail('should not call this function')
    next()
  }), instance)

  instance.run(req, res)
})

test('run restricted by array path', t => {
  t.plan(9)

  const instance = middie(function (err, a, b) {
    t.error(err)
    t.equal(a, req)
    t.equal('/test', req.url)
    t.equal(b, res)
  })
  const req = {
    url: '/test'
  }
  const res = {}

  t.equal(instance.use(function (req, res, next) {
    t.ok('function called')
    next()
  }), instance)

  t.equal(instance.use(['/test', '/other-path'], function (req, res, next) {
    t.ok('function called')
    next()
  }), instance)

  t.equal(instance.use(['/no-call', 'other-path'], function (req, res, next) {
    t.fail('should not call this function')
    next()
  }), instance)

  instance.run(req, res)
})

test('Should strip the url to only match the pathname', t => {
  t.plan(6)

  const instance = middie(function (err, a, b) {
    t.error(err)
    t.equal(a, req)
    t.equal('/test#foo?bin=baz', req.url)
    t.equal(b, res)
  })
  const req = {
    url: '/test#foo?bin=baz'
  }
  const res = {}

  t.equal(instance.use('/test', function (req, res, next) {
    t.pass('function called')
    next()
  }), instance)

  instance.run(req, res)
})
