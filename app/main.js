const electron = require('electron');

const {app} = electron;

const {BrowserWindow} = electron;

let win;

function createWindow() {

 const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({width, height,resizable:false})

  win.loadURL(`file://${__dirname}/UI/index.html`);

  // Open the DevTools.
 //win.webContents.openDevTools();

 
}
global.sharedObject = {
  someProperty: 'default value'
};


app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
