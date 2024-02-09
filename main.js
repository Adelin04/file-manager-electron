const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  ipcRenderer,
} = require("electron");
const path = require("path");

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// async function getDir() {
//   const showDialog = await remote.dialog.showOpenDialog({
//     properties: ['openDirectory']
//   });
//   // Do things with showDialog
//   console.log(showDialog.filePaths) // logs the directory path.
// }
const mainMenu = [
  {
    label: "File",
    submenu: [
      {
        label: "Open",
        acclerator: "CmdOrCtrl+O",
        click: () => {
          console.log("open clicked");
          fileOpen();
        },
      },
      {
        type: "separator",
      },
    ],
  },
];

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 700,
    // resizable:false,
    fullscreen: false,
    // The lines below solved the issue
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadURL('https://e-commerce-boutique.netlify.app');
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const menu = new Menu.buildFromTemplate(mainMenu);
  Menu.setApplicationMenu(menu);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const fileOpen = async () => {
  const files = await dialog.showOpenDialog(mainWindow, {
    properties: ["multiSelections","openDirectory"],
  });
  if (!files) return;
  
  console.log('...',files);

  //manipulate the first file to extract the pathDirectory
  // const indexOfLastSlash = files.filePaths[0].lastIndexOf("\\");
  // const directorySelected = files.filePaths[0].slice(0, indexOfLastSlash);

  mainWindow.webContents.send("open-file", {
    directoriesSelected: files.filePaths,
  });

};
