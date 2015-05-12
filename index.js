'use strict'

const S3Lister = require('s3-lister')
const Batch = require('batch-then')
const knox = require('knox')

module.exports = Run

function Run(options) {
  if (!(this instanceof Run)) return new Run(options)

  this.options = options = options || {}
  this.client = knox.createClient(options)

  if (typeof options.concurrency === 'number') this.concurrency = options.concurrency
  if (typeof options.test === 'function') this.test = options.test
  if (typeof options.update === 'function') this.update = options.update
  if (typeof this.test !== 'function') throw new TypeError('.test() function is required!')
  if (typeof this.update !== 'function') throw new TypeError('.update() function is required!')
}

// default number of files to check at a time.
Run.prototype.concurrency = 10

Run.prototype.then = function (resolve, reject) {
  return this._list().then(resolve, reject)
}

Run.prototype._list = function () {
  const self = this

  this.lister = new S3Lister(this.client, this.options)
  this.batch = new Batch()
  this.batch.concurrency(this.concurrency)

  this.lister.on('data', function (data) {
    self.batch.push(function () {
      return self._updateObject(data.Key)
    })
  })

  return new Promise(function (resolve, reject) {
    // wait until all the files have been listed
    self.lister.on('error', reject)
    self.lister.on('end', resolve)
  }).then(function () {
    // wait until all the AJAX commands are done
    return self.batch
  })
}

/**
 * Given a key, gets the headers for the object.
 * If the object needs to be updated depending on `.test()`, executes .update().
 */

Run.prototype._updateObject = function (key) {
  const self = this

  return new Promise(function (resolve, reject) {
    self.client.head(key).on('response', function (res) {
      res.resume()
      resolve(res.headers)
    }).on('error', reject).end()
  }).then(function (headers) {
    return Promise.resolve(self.test(key, headers)).then(function (val) {
      if (!val) return

      return Promise.resolve(self.update(key, headers)).then(function (newHeaders) {
        if (typeof newHeaders !== 'object') throw new TypeError('.update() must return an object of headers')

        newHeaders['x-amz-metadata-directive'] = 'REPLACE'

        return new Promise(function (resolve, reject) {
          self.client.copy(key, key, newHeaders).on('response', function (res) {
            /* istanbul ignore next */
            if (res.statusCode !== 200) {
              res.setEncoding('utf8')
              res.on('data', function (data) {
                console.error(data)
              })
              reject(new Error('Error updating metadata: ' + res.statusCode))
              return
            }

            res.resume()
            resolve()
          }).on('error', reject).end()
        })
      })
    })
  })
}
