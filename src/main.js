// Modules to control application life and create native browser window
'use strict'
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain;
// var ui = require('./ui')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800, 
    height: 600,
    show: false
  })

  // and load the index.html of the app.
  // win.loadFile('index.html')
  win.loadURL(`file://${__dirname}/index.html`);
 
  win.once('ready-to-show', () => { 
    win.show(); 
    console.log("win#show called")
    win.webContents.send('start')
  })//don't show until ready
  win.webContents.openDevTools()
  win.on('closed', () => { win = null })
  win.setMenuBarVisibility(false)
  process.on('uncaughtException', function (err) {
    console.log(err);
  })
}

app.on('ready', createWindow)


app.on('window-all-closed', function () {
  //fun osx handling - check electron docs for more information
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // Win should be initulized already, but just in case - osx problem again
  if (win === null) {
    createWindow()
  }
})
