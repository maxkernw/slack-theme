const homedir = require('os').homedir();
const path = require('path');
const fs = require('fs');

const index = path.normalize(homedir + "/AppData/Local/slack/app-3.3.3/resources/app.asar.unpacked/src/static/index.js")
const ssb = path.normalize(homedir + "/AppData/Local/slack/app-3.3.3/resources/app.asar.unpacked/src/static/ssb-interop.js")

const uninstall = (file, path) =>
    fs.readFile(file, (err, data) => {
        fs.writeFileSync(path, data, { encoding: 'utf8', flag: 'w' })
        console.log(path)
        console.log("reverted")
    });

uninstall("uninstallFiles/uninstall1.js", index);
uninstall("uninstallFiles/uninstall2.js", ssb);
