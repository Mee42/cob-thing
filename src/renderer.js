
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;


let ui = {
    button : document.getElementById('button')
}

ui.button.onclick = () => {
    ui.button.textContent = NetworkTables.containsKey('key')
}
