let myFs = require("./myFs");
let readline = require("readline");
const { realpath } = require("fs");
function main(argv) {
    let to = argv[0];//目标目录
    let from1 = argv[1];//复制源文件
    let from2 = argv[2];//复制源文件2
    let splash = argv[3];//是否删除splash;
    console.log("目录1", to)
    console.log("目录2", from1)
    console.log("目录3", from2)
    myFs.delDir(to, () => {
        console.log(">>>已清空目标文件")
        myFs.copyDir(from1, to, () => {
            console.log(">>>文件夹1复制成功")
            if (from2) {
                myFs.copyDir(from2, to, () => {
                    if (splash) {
                        myFs.delSomeDir(to);
                    }
                    overFunc();
                });
            } else {
                overFunc();
            }
        })
    })
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function overFunc() {
    //等待控制台输入：
    rl.question('运行结束：', (answer) => {
        // rl.close(); //关闭cmd弹框
    });
}

main(process.argv.slice(2));