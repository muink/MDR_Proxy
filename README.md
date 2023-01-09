## 说明
## Description

支持了最新版 headphones 9<br />
~~因为涉及到证书导入以及中间人攻击, 为了避免产生纠纷, 不再提供 app 下载~~

**因为咨询人数过多, 所以再次添加 app, 由于涉及到证书导入以及中间人攻击, 使用本程序产生的任何后果, 包括但不限于支付软件被盗, 社交软件乱发信息, 手机被锁等, 本人概不负责**

Support for the latest version of headphones 9<br />
~~Due to certificate import and man-in-the-middle attacks, to avoid disputes, the app is no longer available for download~~

**Due to the large number of inquiries, the app has been added again. However, due to certificate import and man-in-the-middle attacks, the author is not responsible for any consequences arising from the use of this program, including but not limited to the theft of payment software, social software sending messages at random, and the locking of phones.**

## 使用

## Usage

如果你不理解此程序, 已经有不少人编写了使用说明, 在此表示感谢<br />
以下为部分链接, 如果你的内容想加入到列表或者想从列表里去除, 请联系我

If you don't understand this program, many people have written instructions, thank you<br />
The following are some links, if you want to add or remove your content from the list, please contact me

[MrWalkman](https://www.mrwalkman.com/p/mdrproxyfwsidegradetool.html)<br />
[酷安](https://www.coolapk.com/feed/35048130)<br />
[什么值得买](https://post.smzdm.com/p/a997pdz5/)<br />
[reddit](https://www.reddit.com/r/sony/comments/dpsmsq/wh1000xm3_custom_firmware_flash_mdr_proxy/)<br />
[荔枝数码](https://www.lizhi.io/blog/62275295)<br />

## 附录

关于扩充内容与工具
+ `mdrproxy_ca.pem`: 用于MITM劫持headphones app下载流量的中间人证书, 名称Green AS(Green TLS CA)
  如果使用原版headphones app, 使用MDR_Proxy安装固件时则需要作为系统证书安装此文件并允许此证书
+ `mdr`: `mdr.ts`的Bash实现, 并扩展其功能使其成为一个Cli工具
  使用方法为`./mdr -c <categoryID> -s <serviceID> | base64 -d`
+ `mirror`: 固件镜像工具, 可以从官网下载最新的固件并保存到`./assets`目录下
  使用方法为`./mirror <Model>`  
  如要刷新整个库存: `sed -nE "1,/^\| *Model *\| *categoryID *\| *serviceID *\| *HTTPS *\|$/d; /^\| *-+ *\| *-+ *\| *-+ *\| *-+ *\|$/n;p" README.md | cut -f2 -d'|' | sed -E "s|^ +||g;s| +$||g" | xargs -I{} ./mirror "{}"`

## Appendix

| Model      | categoryID | serviceID             | HTTPS |
| ---------- | ---------- | --------------------- | ----- |
| WI-1000X   | HP001      | MDRID285300           | ❌    |
| WF-1000X   | HP001      | MDRID286500           | ❌    |
| WH-1000XM2 | HP001      | MDRID289200           | ❌    |
| WH-H900N   | HP001      | MDRID289300           | ❌    |
| WH-CH700N  | HP001      | MDRID290800           | ❌    |
| WF-SP700N  | HP001      | MDRID291100           | ❌    |
| WI-SP600N  | HP001      | MDRID291200           | ❌    |
| WH-1000XM3 | HP001      | MDRID291600           | ❌    |
| WI-C600N   | HP001      | MDRID292400           | ❌    |
| WI-1000XM2 | HP001      | MDRID292800           | ❌    |
| WH-XB900N  | HP001      | MDRID292900           | ❌    |
| WH-XB700   | HP001      | MDRID293000           | ❌    |
| WF-1000XM3 | HP001      | MDRID293100           | ❌    |
| WH-H910N   | HP001      | MDRID294000           | ❌    |
| WH-H810    | HP001      | MDRID294100           | ❌    |
| WF-H800    | HP001      | MDRID294200           | ❌    |
| WH-1000XM4 | HP002      | MDRID294300           | ✔️    |
| WF-SP800N  | HP002      | MDRID294600           | ✔️    |
| WF-1000XM4 | HP002      | MDRID294800           | ✔️    |
| WF-LS900N  | HP002      | MDRID295000           | ✔️    |
| WH-XB910N  | HP002      | MDRID295100           | ✔️    |
| WF-L900    | HP002      | MDRID295300           | ✔️    |
| WH-1000XM5 | HP002      | MDRID295400           | ✔️    |
| INZONE H9  | HP002      | MDRID295900           | ✔️    |
