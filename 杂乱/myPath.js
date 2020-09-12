
let fs = require("fs");
let path = require("path");

// module.exports = {
// }

/**
 * 同步遍历所有文件
 * @param {*} dir 路径
 * @param {*} callback 
 */
function travelSync(dir, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);
        if (fs.statSync(pathname).isDirectory()) {
            travel(pathname, callback);
        } else {
            callback(pathname);
        }
    });
}

/**
 * 异步遍历所有文件
 * @param {*} dir 
 * @param {*} callback 
 * @param {*} finish 
 */
function travel(dir, callback, finish) {
    fs.readdir(dir, function (err, files) {
        (function next(i) {
            if (i < files.length) {
                var pathname = path.join(dir, files[i]);
                fs.stat(pathname, function (err, stats) {
                    if (stats.isDirectory()) {
                        travel(pathname, callback, function () {
                            next(i + 1);
                        });
                    } else {
                        callback(pathname, function () {
                            next(i + 1);
                        });
                    }
                });
            } else {
                finish && finish();
            }
        }(0));
    });
}

function travelOver(pathname, next) {
    console.log("@@" + pathname)
    next();
}

function travelFinish() {

}


//对外接口
function travelPathSync(dir) {
    let path = [];
    let cb = (pathname) => {
        console.log('AA', pathname)
        path.push(pathname);
    }
    travelSync(dir, cb)
    return path;
};

function travelPath(dir, finish) {
    travel("D:/testProject/node/1/", travelOver, finish)
};

// let pathSync = travelPathSync("D:/testProject/node/1/");
travelPath("D:/testProject/node/1/",()=>{
    console.log("eeeeeeee",)
});

console.log("))))");




