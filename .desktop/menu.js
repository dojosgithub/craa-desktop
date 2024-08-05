import { app, dialog, BrowserWindow, Menu, shell } from 'electron';
const path = require('path');
const url = require('url');

export const CRAAMenuTemplate = [
  {
    label: 'Find',
    submenu: [
    ]
  },
  {
    label: 'Tools',
    submenu: [
      {
        label: 'Email Manager',
        click() {
          // require('electron').shell.openExternal('https://electron.atom.io')
          // require('electron').shell.openExternal('https://electron.atom.io')
           // let win = new BrowserWindow({width: 800, height: 600})
           // win.loadURL(url.format ({
           //    pathname: path.join(__dirname, 'index.html'),
           //    protocol: 'file:',
           //    slashes: true
           // }))

           // win.loadURL('http://localhost:3000/uPXcEmlsQPxgFpO91UY9wN4lTX3x6X7EpwwRx06sXQbabcxPAV3ggaNqah02Ylu/simulations')

// const startUrl =url.format({
//             pathname: path.join(__dirname, '/../build/index.html'),
//             protocol: 'file:',
//             slashes: true
//         });
//     win.loadURL(startUrl);


        }
      }
    ]    
  },
  {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  },
  {
    label: 'Navigate',
    submenu: [
    ]
  },  
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  }  
]

if (process.platform === 'darwin') {
  // const appName = app.getName()
  const appName = 'CRAA Admin Desktop'
  CRAAMenuTemplate.unshift({
    label: appName,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // CRAAMenuTemplate[1].submenu.push(
  //   {
  //     type: 'separator'
  //   },
  //   {
  //     label: 'Speech',
  //     submenu: [
  //       {
  //         role: 'startspeaking'
  //       },
  //       {
  //         role: 'stopspeaking'
  //       }
  //     ]
  //   }
  // )
  // CRAAMenuTemplate[5].submenu = [
  //   {
  //     role: 'close'
  //   },
  //   {
  //     role: 'minimize'
  //   },
  //   {
  //     role: 'zoom'
  //   },
  //   {
  //     type: 'separator'
  //   },
  //   {
  //     role: 'front'
  //   }
  // ]
} else {
  CRAAMenuTemplate.unshift({
    label: 'File',
    submenu: [
      {
        role: 'about'
      },
      {
        role: 'quit'
      }
    ]
  })
}

