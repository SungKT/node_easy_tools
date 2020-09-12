/**
 * @author SungKT
 * @date 2020-8-4
 * 
 * 
 * 本脚本主要用于修正TS目录中的import引用路径错误问题
 * ts脚本位置发生变化时，import对应引用目录会指向错误,所以有此脚本
 * 
 * 用法 node repairPath.js <路径>
 * 
 * 示例 [统计 ./src 下的 js 文件]: node repairPath.js ./src
 */

const fs = require('fs')
let path = require('path')
const readline = require("readline")

// 获取命令行参数
const parm = process.argv.splice(2)
// 第一个参数是路径
const rootPath = parm[0]
// 后面的所有参数都是文件后缀
let types = parm.splice(1)
if (types.length === 0) types = ['.js', '.ts']
// 需要过滤的文件夹
const filter = ['./node_modules', './.git', './.tscache']

//result中item={name,path,importLines}
let result = [] //用于收集JS/TS脚本
let resultKey = {} //用于保存脚本名称与脚本信息

/**
 * 递归所有文件夹统计
 * 
 * @param {string} pt 根目录
 */
async function start(pt) {
    fs.readdirSync(pt).map(file => `${pt}/${file}`)
        .forEach(file => {
            const stat = fs.statSync(file)
            // 是文件夹就递归
            if (stat.isDirectory()) {
                if (filter.indexOf(pt) != -1) return
                return start(file)
            }
            // 是文件并且后缀名符合就执行统计
            if (types.indexOf(path.extname(file)) != -1) count(file)
        })
};

/**
 * 对指定文件进行统计
 * 同时建立脚本信息索引
 * @param {string} path 文件路径
 */
async function count(path) {
    const rep = await fs.readFileSync(path).toString()
    const lines = rep.split('\n')
    //获取import 引用
    const importLines = lines.filter(line => new RegExp(/^import.*from\s("|').*("|')/).test(line.trimStart()))
    let index = path.lastIndexOf("/");
    let indexEnd = path.lastIndexOf(".");
    let name = path.substring(index + 1, indexEnd); //获取脚本名称
    let item = {
        name: name,
        path: path,
        importLines: importLines
    }
    result.push(item)
    resultKey[item.name] = item;//建立脚本名称的索引
}

//修复所有的路径
function repairPath(result) {
    for (let i = 0; i < result.length; i++) {
        let lines = result[i].importLines;
        if (!!!lines) continue;
        let curPath = result[i].path; //当前脚本路径
        let oldPathContentArr = [];
        let newPathContentArr = [];
        for (let k = 0; k < lines.length; k++) {
            let index = lines[k].lastIndexOf("/");
            if (index < 0) continue;
            let name = getImportName(lines[k])
            let nameInfo = resultKey[name];
            if (nameInfo) {
                let curDirPath = filePathToDir(curPath);
                let newPathContent = changeRelativePath(curDirPath, nameInfo.path);
                let oldPathContent = getImportPath(lines[k]);
                // replaceSomeContent(curPath, oldPathContent, newPathContent)
                if (oldPathContent == newPathContent) continue;
                oldPathContentArr.push(oldPathContent);
                newPathContentArr.push(newPathContent)
            }
        }

        replaceSomeContent(curPath, oldPathContentArr, newPathContentArr)
    }
}

/**
 * 获取import的引用名称 
 * @param {*} line 
 * 要剔除 .js .ts
 */
function getImportName(line) {
    let index = line.lastIndexOf("/");
    if (index < 0) return '';
    // let indexEnd1 = line.lastIndexOf('\"')
    // let indexEnd2 = line.lastIndexOf("\'");
    // let indexEnd = indexEnd1 > indexEnd2 ? indexEnd1 : indexEnd2;
    let indexEnd = getQuotationMarks(line, false);
    let name = line.substring(index + 1, indexEnd); //获取脚本名称
    name = name.replace(".js", "")
    name = name.replace(".ts", "")
    return name;
}

/**
 * 获取import from后边引号中的路径
 * @param {*} line 
 */
function getImportPath(line) {
    let indexStart = getQuotationMarks(line, true)
    let indexEnd = getQuotationMarks(line, false)
    let oldPath = line.substring(indexStart + 1, indexEnd); //获取脚本名称
    return oldPath;
}

function getQuotationMarks(line, isStart) {
    let index = 0;
    let index1 = 0;
    let index2 = 0;
    if (isStart) {
        index1 = line.indexOf('\"')
        index2 = line.indexOf("\'")
    } else {
        index1 = line.lastIndexOf('\"')
        index2 = line.lastIndexOf("\'")
    }
    index = index1 > index2 ? index1 : index2;
    return index;
}

/**
 * 把文件路径转换为当前文件夹的路径
 * @param {*} path 
 */
function filePathToDir(path) {
    let a = path;
    let last = a.lastIndexOf("/");
    a = a.substring(0, last + 1);
    return a;
}

/**
 * 将两个路径和并为一个新的相对路径
 * @param {*} from 以当前的文件夹路径
 * @param {*} to 目标文件路径
 */
function changeRelativePath(from, to) {
    //将绝对路径转化为相对路径 from---to
    // from = path.resolve(rootPath, from);
    // to = path.resolve(rootPath, to);

    let newPath = path.relative(from, to);
    //目标路径深度要深于当前目录时； 
    //例如 from: /test/a to:/test/dir/b  
    //结果为：dir/b 期望是./dir/b
    if (newPath[0] != ".") {
        newPath = "./" + newPath
    }
    //windows平台把 \\转换成/ 同时剔除后缀
    while (newPath.indexOf("\\") != -1) {
        newPath = newPath.replace("\\", "/")
    }
    newPath = newPath.replace(".js", "")
    newPath = newPath.replace(".ts", "")
    return newPath;
}

function replaceSomeContent(filePath, oldContentArr, newContentArr) {
    if (oldContentArr.length < 1) return;
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.log("读取报错了：", filePath)
            return console.log(err);
        }
        let result = data;
        // console.log("修复目录:",filePath);
        for (let index = 0; index < oldContentArr.length; index++) {
            let oldC = oldContentArr[index];
            let newC = newContentArr[index];
            result = result.replace(oldC, newC);
            console.log("修复", oldC, newC)
        }
        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
                console.log("写入报错了：", filePath)
                return console.log(err);
            }
        });
    });
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function overFunc() {
    //等待控制台输入：
    rl.question(' ', (answer) => {
        // rl.close(); //关闭cmd弹框
    });
}

(async () => {
    await start(rootPath)
    // console.table(result)
    repairPath(result)
    overFunc();
})()
