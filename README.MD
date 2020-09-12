## node小工具合集

~~从网上搜集整合了一些node小工具，考虑到可能有些win电脑没有装node环境，所以提供了exe工具。~~

~~通用2种使用方法：~~

~~1.使用node环境 ：node node脚本 参数......~~

~~2.使用exe工具：exe 参数......~~

~~pkg打包生成的exe太大了，就不放了~~



## 1.countCode  

#### 统计指定目录下代码行数及注释率

> 用法: node count.js <路径> [后缀名]...
>
> 后缀名不填的话默认为统计 .js 和 .ts 文件
>
> 示例 [统计 ./src 下的 js 文件]: node countCode.js ./src
>
> 示例 [统计 ./dist 下的 java 文件]: node countCode.js ./src .java
>
> 示例 [统计 d:\testFolder文件夹]: node c:\countCode.js d:\testFolder
>
> 注意：后缀名带有字符点：“.”