require('babel-register')({
    ignore: /node_modules\/(?!\@upupbox|koa-static|koa-send)/
});
require('babel-polyfill');

const path = require('path');
const router = require('../server').default;
const Mock = require('mockjs');
const mockData = require('./mock.js').default;
const pkg = require('../package.json');


// 引入前后分离中间层模块
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
    proxy: {
        target: 'http://backend-test.hyp.163.com'
    },
    router
});

// 为了使用mock.js，这里我们重写app上面的proxy方法;
const oldProxy = app.context.proxy;

app.context.proxy = function (...args) {
    if (mockData.hasOwnProperty(args[0].url)) {
        return Promise.resolve({
            data: {
                resCode: 0,
                data: Mock.mock(mockData[args[0].url])
            }
        });
    }

    return oldProxy.call(this, ...args);
};

app.listen(4000);
