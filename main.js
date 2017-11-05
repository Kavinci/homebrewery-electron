const { dialog, Menu, MenuItem, ipcMain, shell } = require('electron');
const { writeFileSync } = require('fs');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let current;

const template = [
  {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        role: 'open',
        accelerator: 'Cmd+O',
        click: () => {
          const files = dialog.showOpenDialog({ properties: ['openFile'] });
          if (files) {
            current = files[0];
            mainWindow.webContents.send('open', files[0]);
          }
        }
      },
      {
        label: 'Save',
        role: 'save',
        accelerator: 'Cmd+S',
        click() {
          if (current) {
            mainWindow.webContents.send('save', current);
          } else {
            const file = dialog.showSaveDialog();
            if (file) {
              mainWindow.webContents.send('save', file);
            }
          }
        }
      },
      {
        label: 'Save As',
        role: 'save-as',
        accelerator: 'Cmd+Shift+S',
        click: () => {
          const file = dialog.showSaveDialog();
          if (file) {
            mainWindow.webContents.send('save', file);
            current = file;
          }
        }
      },
      {
        label: 'Export as PDF',
        role: 'print',
        accelerator: 'Cmd+Shift+E',
        click() {
          const file = dialog.showSaveDialog();
          if (file) {
            mainWindow.webContents.printToPDF(
              {
                printBackground: true,
                pageSize: 'Letter'
              },
              (err, data) => {
                writeFileSync(file, data);
              }
            );
          }
        }
      },
      { role: 'quit', label: 'Quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }]
  }
];

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1680,
    height: 1050,
    minWidth: 1280,
    vibrancy: 'ultra-dark',
    titleBarStyle: 'hidden'
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});