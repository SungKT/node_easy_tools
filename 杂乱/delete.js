
const fs = require('fs');
var async = require("async");

var isUnixHiddenPath = function (path) {
    return (/(^|\/)\.[^\/\.]/g).test(path);
};

function delDir(path, deleteSelf = true) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            let isHide = isUnixHiddenPath(curPath)
            if (!isHide) { //不处理隐藏文件
                if (fs.statSync(curPath).isDirectory()) {
                    delDir(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            } else {
                console.log("隐藏的文件" + curPath);
            }
        });
        if (deleteSelf) {
            fs.rmdirSync(path);  // 删除文件夹自身
        }
    }
}


function main(argv) {
    let to = argv[0];//目标目录
    // let from1 = argv[1];//复制源文件
    // let from2 = argv[2];//复制源文件2
    let cb = () => {
        console.log("vvvv222");
    }
    async.waterfall([function (callback) {
        delDir(to, false)
        callback();
    }], cb)

}

main(process.argv.slice(2));
