require('babel-register')({
    ignore: /node_modules\/(?!\@upupbox|koa-static|koa-send)/
});
require('babel-polyfill');

const path = require('path');
const router = require('../server').default;
const pkg = require('../package.json');
const middleLayer = require('site-middle-layer');

router.prefix(pkg.publishConfig.path);

// 设置mongoose使用的promise
middleLayer.mongoose.Promise = Promise;
// 连接数据库
middleLayer.mongoose.connect('mongodb://localhost/site-dev');

const app = middleLayer.create({
    static: {
        root: path.join(__dirname, '../client')
    },
    render: {
        root: path.join(__dirname, '../.tmp')
    },
    router
});

app.listen(4000);
