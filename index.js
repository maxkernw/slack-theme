const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');

const version = "app-3.3.3"
const index = path.normalize(homedir + `/AppData/Local/slack/${version}/resources/app.asar.unpacked/src/static/index.js`)
const ssb = path.normalize(homedir + `/AppData/Local/slack/${version}/resources/app.asar.unpacked/src/static/ssb-interop.js`)

const install = (file, path) =>
    fs.readFile(file, (err, data) => {
        fs.writeFileSync(path, data, { encoding: 'utf8', flag: 'w' })
        console.log(path)
        console.log("replaced")
    })

install("installFiles/replace.js", index);
install("installFiles/replace2.js", ssb);