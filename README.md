支持了最新版headphones 8, 为了方便, 修改版headphones放入Releases, 请自行下载

关于扩充内容与工具
+ `mdrproxy_ca.pem`: 用于MITM劫持headphones app下载流量的中间人证书, 名称Green AS(Green TLS CA)
  如果使用原版headphones app, 使用MDR_Proxy安装固件时则需要作为系统证书安装此文件并允许此证书
+ `mdr`: `mdr.ts`的Bash实现, 并扩展其功能使其成为一个Cli工具
  使用方法为`./mdr -c <categoryID> -s <serviceID> | base64 -d`
+ `mirror`: 固件镜像工具, 可以从官网下载最新的固件并保存到`./assets`目录下
  使用方法为`./mirror <Model>`
  刷新整个库存: `sed -nE "1,/^Model\|categoryID\|serviceID\|HTTPS$/d; /^-\|-\|-\|-$/n;p" README.md | cut -f1 -d'|' | xargs -I{} ./mirror {}`

Model|categoryID|serviceID|HTTPS
-|-|-|-
WI-1000X|HP001|MDRID285300|❌
WF-1000X|HP001|MDRID286500|❌
WH-1000XM2|HP001|MDRID289200|❌
WH-H900N|HP001|MDRID289300|❌
WH-CH700N|HP001|MDRID290800|❌
WF-SP700N|HP001|MDRID291100|❌
WI-SP600N|HP001|MDRID291200|❌
WH-1000XM3|HP001|MDRID291600|❌
WI-C600N|HP001|MDRID292400|❌
WI-1000XM2|HP001|MDRID292800|❌
WH-XB900N|HP001|MDRID292900|❌
WH-XB700|HP001|MDRID293000|❌
WF-1000XM3|HP001|MDRID293100|❌
WH-H910N|HP001|MDRID294000|❌
WH-H810|HP001|MDRID294100|❌
WF-H800|HP001|MDRID294200|❌
WH-1000XM4|HP002|MDRID294300|✔️
WF-SP800N|HP002|MDRID294600|✔️
WF-1000XM4|HP002|MDRID294800|✔️
WF-LS900N|HP002|MDRID295000|✔️
WH-XB910N|HP002|MDRID295100|✔️
WF-L900|HP002|MDRID295300|✔️
WH-1000XM5|HP002|MDRID295400|✔️
