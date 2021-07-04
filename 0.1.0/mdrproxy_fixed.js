"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const zlib_1 = __importDefault(require("zlib"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const util_1 = require("util");
const fs_1 = require("fs");
const readline_1 = require("readline");
const crypto_1 = require("crypto");
const hasKey = fs_1.existsSync(`${__dirname}/security/mdrproxy-key.pem`);
const hasCert = fs_1.existsSync(`${__dirname}/security/mdrproxy-cert.pem`);
if (!hasKey || !hasCert)
    throw '未找到证书文件';
const FSreadFile = util_1.promisify(fs_1.readFile);
const FSreaddir = util_1.promisify(fs_1.readdir);
const infoXML = `<?xml version="1.0" encoding="UTF-8"?><InformationFile LastUpdate="2021-05-01T00:00:00Z" Noop="false" Version="1.0">
<ControlConditions DefaultServiceStatus="open" DefaultVariance="0"/>
<ApplyConditions>
    <ApplyCondition ApplyOrder="1" Force="false">
        <Rules>
            <Rule Type="System" Key="Model" Value="CUSTOM" Operator="NotEqual"/>
            <Rule Type="System" Key="SerialNo" Value="0" Operator="GreaterThanEqual"/>
            <Rule Type="System" Key="FirmwareVersion" Value="0" Operator="NotEqual"/>
        </Rules>
        <Distributions>
            <Distribution ID="FW" InstallParams="" InstallType="binary" MAC="{FWsha1}" Size="{FWlength}" Type="" URI="https://info.update.sony.net/custom_fw.bin" Version="1"/>
            <Distribution ID="Disclaimer" InstallParams="" InstallType="notice" MAC="{Disclaimersha1}" Size="{Disclaimerlength}" Type="" URI="https://info.update.sony.net/custom_disclaimer.xml" Version="1"/>
        </Distributions>
        <Descriptions DefaultLang="Chinese(Simplified)">
            <Description Lang="Chinese(Simplified)" Title="CS"><![CDATA[请勿插入音频线，USB线或充电保护盒。
否则可能会导致本设备发生故障。]]></Description>
        </Descriptions>
    </ApplyCondition>
</ApplyConditions>
</InformationFile>`;
const disclaimerXML = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?> 

<NoticeFile Version="1.0" DefaultLocale="China">
    <Notice Locale="China">
        <Text><![CDATA[
※ 请在蓝牙连接最稳定的环境下进行更新。
* 请注意，在乘坐火车等车辆时，或者在Wi-Fi、微波炉、无绳电话以及其他许多无线电波等2.4GHz频带的无线电波混杂的环境中，不要更新。

※ Sony | Headphones Connect ※
更新主机之前，请更新至最新版本

[警告]
0) 本人不对因使用此软件造成的任何损失负责，使用前请确保为正品行货，做好需要保修的心理准备
1) 软件更新需要大约34分钟（Android）和44分钟（iOS）
更新下载、数据传输和更新期间切勿"关闭电源"。
否则，该装置可能会变得无法使用。
2) 请在确认这些耳机和Android设备（或iOS设备）有足够的电池寿命后更新。
3) 如果Bluetooth Low Energy设备（佩戴式终端，智能手表等）连接到Android设备（或iOS设备），则可能无法更新。
更新之前，请断开所有蓝牙设备和Android设备（或iOS设备）的连接。

]]></Text>
    </Notice>
</NoticeFile>`);
start();
async function start() {
    const select0 = await choose0();
    switch (select0) {
        case '1':
            startProxy('1');
            break;
        case '2':
            const select02 = await choose02();
            switch (select02) {
                case '1':
                    startProxy('21');
                    break;
                case '2':
                    startProxy('22');
                    break;
                case '3':
                    startProxy('23');
                    break;
            }
            break;
        case '3':
            const select03 = await choose03();
            startProxy('3', select03);
            break;
    }
}
function choose() {
    return new Promise(resolve => {
        const rl = readline_1.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.prompt();
        rl.once('line', line => {
            rl.close();
            resolve(line);
        });
    });
}
async function choose0() {
    console.log(`请选择功能:
1. 强制更新固件
2. 强制切换固件
3. 强刷自定义固件(非常危险!非常危险!!非常危险!!!)`);
    const select = await choose();
    if (['1', '2', '3'].includes(select))
        return select;
    else
        return choose0();
}
async function choose02() {
    console.log(`请选择区域:
1. 00(国际版)
2. 01(日本版?)
3. 02(中国版)`);
    const select = await choose();
    if (['1', '2', '3'].includes(select))
        return select;
    else
        return choose02();
}
async function choose03() {
    const files = await FSreaddir(`${__dirname}/custom/`);
    console.log('请选择固件:');
    files.forEach((name, id) => console.log(`${id + 1}. ${name}`));
    const select = await choose();
    const file = files[+select - 1];
    if (file !== undefined)
        return await FSreadFile(`${__dirname}/custom/${file}`);
    else
        return choose03();
}
async function startProxy(mode, fw) {
    const ssl = {
        key: await FSreadFile(`${__dirname}/security/mdrproxy-key.pem`),
        cert: await FSreadFile(`${__dirname}/security/mdrproxy-cert.pem`)
    };
    const fakeServer = https_1.default.createServer(ssl)
        .on('request', async (cReq, cRes) => {
        const u = new URL(`https://info.update.sony.net${cReq.url}`);
        console.log('已捕获到', cReq.url);
        if (u.pathname.endsWith('info.xml')) {
            const pathSplit = u.pathname.match(/\/(?<categoryID>\w{5})\/(?<serviceID>\w{11})\//);
            if (pathSplit === null)
                nothing();
            else {
                const { categoryID, serviceID } = pathSplit.groups;
                if (mode === '1' || mode[0] === '2') {
                    const newServiceID = mode === '1' ? serviceID : `${serviceID.slice(0, -1)}${Number.parseInt(mode[1]) - 1}`;
                    const XML = await decryptedXML(categoryID, newServiceID);
                    if (XML === undefined)
                        nothing();
                    else {
                        const editedXML = XML.replace(/<Rule Type="System" Key="FirmwareVersion" Value="[\d\.]+" Operator=".+?"\/>/g, '<Rule Type="System" Key="FirmwareVersion" Value="0" Operator="NotEqual"/>');
                        const myXML = await encryptedXML(categoryID, serviceID, editedXML);
                        end(zlib_1.default.gzipSync(myXML), { 'Content-Type': 'application/xml' });
                    }
                }
                else if (mode === '3') {
                    const editedXML = infoXML
                        .replace('{FWsha1}', getHash('sha1', fw))
                        .replace('{FWlength}', fw.length.toString())
                        .replace('{Disclaimersha1}', getHash('sha1', disclaimerXML))
                        .replace('{Disclaimerlength}', disclaimerXML.length.toString());
                    const myXML = await encryptedXML(categoryID, serviceID, editedXML);
                    end(zlib_1.default.gzipSync(myXML), { 'Content-Type': 'application/xml' });
                }
                else
                    nothing();
            }
        }
        else if (u.pathname === '/custom_fw.bin') {
            end(zlib_1.default.gzipSync(fw), { 'Content-Type': 'application/octet-stream' });
        }
        else if (u.pathname === '/custom_disclaimer.xml') {
            end(zlib_1.default.gzipSync(disclaimerXML), { 'Content-Type': 'application/xml' });
        }
        else
            nothing();
        function end(data, headers) {
            cRes.writeHead(200, Object.assign({
                'Accept-Ranges': 'bytes',
                'Content-Encoding': 'gzip',
                'Content-Length': data.length,
            }, headers));
            cRes.write(data, 'binary');
            cRes.end();
        }
        function nothing() {
            const options = {
                hostname: u.hostname,
                port: u.port || 443,
                path: u.pathname,
                method: cReq.method,
                headers: cReq.headers
            };
            const pReq = https_1.default.request(options, pRes => {
                cRes.writeHead(pRes.statusCode, pRes.headers);
                pRes.pipe(cRes);
            }).on('error', () => cRes.end());
            cRes.on('error', () => cReq.destroy());
            cReq.pipe(pReq);
        }
    })
        .listen(0, 'localhost');
    http_1.default.createServer()
        .on('connect', (cReq, cSock, head) => {
        const u = new URL('http://' + cReq.url);
        let port;
        let hostname;
        if (u.hostname === 'info.update.sony.net') {
            port = fakeServer.address().port;
            hostname = 'localhost';
        }
        else {
            port = Number.parseInt(u.port);
            hostname = u.hostname;
        }
        const pSock = net_1.default.connect(port, hostname, () => {
            cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            pSock.write(head);
            pSock.pipe(cSock);
            cSock.pipe(pSock);
        }).on('error', () => cSock.end());
        cSock.on('error', () => pSock.end());
    })
        .listen(8848, '0.0.0.0', () => { console.log('已启动代理服务, 端口: 8848'); });
}
function decryptedXML(categoryID, serviceID) {
    return new Promise(resolve => {
        https_1.default.get(`https://info.update.sony.net/${categoryID}/${serviceID}/info/info.xml`, {
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; XQ-AT52 Build/58.1.A.5.159)',
                'Accept-Encoding': 'gzip'
            }
        }, res => {
            let cRes;
            let rawData = [];
            switch (res.headers['content-encoding']) {
                case 'gzip':
                    cRes = res.pipe(zlib_1.default.createGunzip());
                    break;
                case 'deflate':
                    cRes = res.pipe(zlib_1.default.createInflate());
                    break;
                default:
                    cRes = res;
                    break;
            }
            cRes
                .on('data', (chunk) => rawData.push(chunk))
                .on('end', () => {
                const data = Buffer.concat(rawData);
                if (res.statusCode !== 200) {
                    console.error(res.statusCode, data.toString());
                    resolve(undefined);
                }
                else {
                    const headerLength = data.indexOf('\n\n');
                    const header = data.slice(0, headerLength).toString();
                    const headerSplit = header.match(/eaid:(?<eaid>.*)\ndaid:(?<daid>.*)\ndigest:(?<digest>.*)/);
                    if (headerSplit === null) {
                        console.log(header);
                        return resolve(undefined);
                    }
                    const { eaid, daid, digest } = headerSplit.groups;
                    let enc = '';
                    switch (eaid) {
                        case 'ENC0001':
                            enc = 'none';
                            break;
                        case 'ENC0002':
                            enc = 'des-ede3';
                            break;
                        case 'ENC0003':
                            enc = 'aes-128-ecb';
                            break;
                        default:
                            break;
                    }
                    let has = '';
                    switch (daid) {
                        case 'HAS0001':
                            has = 'none';
                            break;
                        case 'HAS0002':
                            has = 'md5';
                            break;
                        case 'HAS0003':
                            has = 'sha1';
                            break;
                        default:
                            break;
                    }
                    if (enc === '' || has === '') {
                        console.log(header);
                        return resolve(undefined);
                    }
                    const cryptedData = data.slice(headerLength + 2);
                    let keyBuffer;
                    let decryptedData = '';
                    if (enc === 'none')
                        decryptedData = cryptedData.toString();
                    else {
                        if (enc === 'des-ede3')
                            keyBuffer = Buffer.alloc(24);
                        else
                            keyBuffer = Buffer.from([79, -94, 121, -103, -1, -48, -117, 31, -28, -46, 96, -43, 123, 109, 60, 23]);
                        const decipher = crypto_1.createDecipheriv(enc, keyBuffer, '');
                        decipher.setAutoPadding(false);
                        decryptedData = Buffer.concat([decipher.update(cryptedData), decipher.final()]).toString();
                    }
                    if (has !== 'none') {
                        const dataHash = getHash(has, decryptedData);
                        const hash = getHash(has, dataHash + serviceID + categoryID);
                        if (hash !== digest) {
                            console.log(header);
                            return resolve(undefined);
                        }
                    }
                    resolve(decryptedData);
                }
            })
                .on('error', e => {
                console.error('数据接收错误', e);
                resolve(undefined);
            });
        }).on('error', e => {
            console.error('请求错误', e);
            resolve(undefined);
        });
    });
}
function encryptedXML(categoryID, serviceID, decryptedData) {
    return new Promise(resolve => {
        const decryptedDataBuffer = Buffer.from(decryptedData.trimEnd());
        const padBuffer = Buffer.alloc(32 - decryptedDataBuffer.length % 32, ' ');
        const WTFXMLBuffer = padBuffer.length === 32 ? decryptedDataBuffer : Buffer.concat([decryptedDataBuffer, padBuffer]);
        const dataHash = getHash('sha1', WTFXMLBuffer);
        const hash = getHash('sha1', dataHash + serviceID + categoryID);
        const headerBuffer = Buffer.from(`eaid:ENC0003
daid:HAS0003
digest:${hash}

`);
        const keyBuffer = Buffer.from([79, -94, 121, -103, -1, -48, -117, 31, -28, -46, 96, -43, 123, 109, 60, 23]);
        const encipher = crypto_1.createCipheriv('aes-128-ecb', keyBuffer, '');
        encipher.setAutoPadding(false);
        const bodyBuffer = Buffer.concat([encipher.update(WTFXMLBuffer), encipher.final()]);
        const encryptedData = Buffer.concat([headerBuffer, bodyBuffer]);
        resolve(encryptedData);
    });
}
function getHash(algorithm, data) {
    return crypto_1.createHash(algorithm).update(data).digest('hex');
}
