'use strict'

const assert = require('assert')

const Update = require('..')

describe('updating cache-control', function () {
  const update = Update({
    key: process.env.S3_HEADERS_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.S3_HEADERS_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_HEADERS_BUCKET,
    test: function (key, headers) {
      return !headers['cache-control']
    },
    update: function (key, headers) {
      return {
        'Cache-Control': 'public, max-age=60'
      }
    },
  })

  const key_no_cache = random()
  const key_w_cache = random()

  it('update w/ cache-control', function (done) {
    update.client.putBuffer(new Buffer(random()), key_w_cache, {
      'cache-control': 'public, max-age=3600',
    }, function (err, res) {
      if (err) return done(err)
      if (res.statusCode !== 200) return done(new Error('Got status code: ' + res.statusCode))
      done()
    })
  })

  it('upload w/o cache-control', function (done) {
    update.client.putBuffer(new Buffer(random()), key_no_cache, function (err, res) {
      if (err) return done(err)
      if (res.statusCode !== 200) return done(new Error('Got status code: ' + res.statusCode))
      done()
    })
  })

  it('should update headers', function () {
    return update
  })

  it('should not have changed existing cache controls', function (done) {
    update.client.headFile(key_w_cache, function (err, res) {
      if (err) return done(err)

      assert.equal(200, res.statusCode)
      assert.equal(res.headers['cache-control'], 'public, max-age=3600')
      done()
    })
  })

  it('should have updated non-existing cache controls', function (done) {
    update.client.headFile(key_no_cache, function (err, res) {
      if (err) return done(err)

      assert.equal(200, res.statusCode)
      assert.equal(res.headers['cache-control'], 'public, max-age=60')
      done()
    })
  })
})

function random() {
  return Math.random().toString(36).slice(2)
}
