
# s3-set-headers

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

Iterate through a bucket, checking whether headers need updating,
and updating them when necessary.

## API

```js
const Update = require('s3-set-headers')

Update({
  // s3 bucket information passed to `knox`
  secret: '',
  key: '',
  bucket: '',

  // s3 listing options passed to s3lister
  prefix: '',

  // maximum number of objects to update concurrently
  concurrency: 5,

  // whether the headers need updating
  test(key, headers) {
    return !headers['cache-control']
  },

  // new headers to set
  update(key, headers) {
    return {
      'cache-control': 'public, max-age=3600',
      'x-amz-acl': 'public-read',
    }
  }
})
```

[npm-image]: https://img.shields.io/npm/v/s3-set-headers.svg?style=flat-square
[npm-url]: https://npmjs.org/package/s3-set-headers
[github-tag]: http://img.shields.io/github/tag/jonathanong/s3-set-headers.svg?style=flat-square
[github-url]: https://github.com/jonathanong/s3-set-headers/tags
[travis-image]: https://img.shields.io/travis/jonathanong/s3-set-headers.svg?style=flat-square
[travis-url]: https://travis-ci.org/jonathanong/s3-set-headers
[coveralls-image]: https://img.shields.io/coveralls/jonathanong/s3-set-headers.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jonathanong/s3-set-headers
[david-image]: http://img.shields.io/david/jonathanong/s3-set-headers.svg?style=flat-square
[david-url]: https://david-dm.org/jonathanong/s3-set-headers
[license-image]: http://img.shields.io/npm/l/s3-set-headers.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/s3-set-headers.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/s3-set-headers
