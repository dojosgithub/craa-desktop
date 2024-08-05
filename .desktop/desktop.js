/* eslint-disable no-unused-vars */
import process from 'process';
import { app, dialog, BrowserWindow, Menu, shell } from 'electron';

// var remote = require('electron').remote;
// var fs = remote.require('fs');
// var electronDialog = remote.dialog;

// import { CRAAMenuTemplate } from './menu.js'
import { CRAAMenuTemplate } from './menu.js'

// import PDFWindow from 'electron-pdf-window'

/**
 * Entry point to your native desktop code.
 *
 * @class
 */
export default class Desktop {
    /**
     * @param {Object} log         - Winston logger instance
     * @param {Object} skeletonApp - reference to the skeleton app instance
     * @param {Object} appSettings - settings.json contents
     * @param {Object} eventsBus   - event emitter for listening or emitting events
     *                               shared across skeleton app and every module/plugin
     * @param {Object} modules     - references to all loaded modules
     * @param {Object} Module      - reference to the Module class
     * @constructor
     */
    constructor({ log, skeletonApp, appSettings, eventsBus, modules, Module }) {
        /**
         * You can delete unused var from the param destructuring.
         * Left them here just to emphasize what is passed. Delete the eslint rule at the top
         * when done.
         * You can also just have a one `config` param and do `Object.assign(this, config);`
         */
        const desktop = new Module('desktop');
        // Get the automatically predefined logger instance.
        this.log = log;

        // From Meteor use this by invoking Desktop.send('desktop', 'closeApp');
        desktop.on('closeApp', () => app.quit());

        // We need to handle gracefully potential problems.
        // Lets remove the default handler and replace it with ours.
        skeletonApp.removeUncaughtExceptionListener();

        process.on('uncaughtException', Desktop.uncaughtExceptionHandler);

        // Chrome problems should also be handled. The `windowCreated` event has a `window`
        // reference. This is the reference to the current Electron renderer process (Chrome)
        // displaying your Meteor app.
        eventsBus.on('windowCreated', (window) => {
            window.webContents.on('crashed', Desktop.windowCrashedHandler);
            window.on('unresponsive', Desktop.windowUnresponsiveHandler);

            // Menu.setApplicationMenu(Menu.buildFromTemplate(CRAAMenuTemplate));

        });

        // Consider setting a crash reporter ->
        // https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md       

        // desktop.on('minimize', () => BrowserWindow.getFocusedWindow().minimize());
        // desktop.on('minimize', () => BrowserWindow.getFocusedWindow()[0].minimize());
        // desktop.on('setWindowSize', () => BrowserWindow.getFocusedWindow().setSize(1024, 768));

        desktop.on('setWindowSize', (event, dimension) => {
            if(BrowserWindow.getFocusedWindow()) {
                BrowserWindow.getFocusedWindow().setSize(dimension.width, dimension.height);
                BrowserWindow.getFocusedWindow().center();
            }
        })

        desktop.on('showMenu', (event) => {
            Menu.setApplicationMenu(Menu.buildFromTemplate(CRAAMenuTemplate));
        }) 

        desktop.on('hideMenu', (event) => {
            Menu.setApplicationMenu(null);
        }) 

        desktop.on('viewScoring', (event, param) => {
            let win = new BrowserWindow({
                width: param.width, 
                height: param.height,
                alwaysOnTop: true,
                // title: "Admin: Scoring Review" //-- not working
            })
            // win.open()
            win.setTitle("Admin: Scoring Review")
            win.loadURL(param.url, {
              postData: [{
                type: 'rawData',
                bytes: Buffer.from('hello=world')
              }],
              extraHeaders: 'Content-Type: application/x-www-form-urlencoded'                
            })
        })        

        desktop.on('viewPDF', (event, file) => {
//           const win = new PDFWindow({
//             width: 800,
//             height: 600
//           })
// // PDFWindow.addSupport(win)
//           win.loadURL(file.url)

//     const path = require(`path`);
//     const qs = require(`query-string`);

//     const param = qs.stringify({file: file.url});
//     // const modalPath = path.join('file://' + __dirname + '/pdfjs/web/viewer.html?' + param);
//     const modalPath = path.join('file://' + app.getAppPath() + '/pdfjs/web/viewer.html?' + param);
// console.log(modalPath, app.getAppPath())
//     let pdfWindow = new BrowserWindow({
//         width: 600,
//         height: 1000,
//         webPreferences: {
//             nodeIntegration: false, 
//             webSecurity: false
//         }
//     });

//     pdfWindow.on('closed', function () { pdfWindow = null });
//     pdfWindow.loadURL(modalPath);
//     pdfWindow.show();

            // shell.openItem(file.url);
            shell.openItem(file);
            // shell.openExternal('https://github.com');
        })

    }

    /**
     * Window crash handler.
     */
    static windowCrashedHandler() {
        Desktop.displayRestartDialog(
            'Application has crashed',
            'Do you want to restart it?'
        );
    }

    /**
     * Window's unresponsiveness handler.
     */
    static windowUnresponsiveHandler() {
        Desktop.displayRestartDialog(
            'Application is not responding',
            'Do you want to restart it?'
        );
    }

    /**
     * JS's uncaught exception handler.
     * @param {string} error - error message
     */
    static uncaughtExceptionHandler(error) {
        // Consider sending a log somewhere, it is good be aware your users are having problems,
        // right?
        Desktop.displayRestartDialog(
            'Application encountered an error',
            'Do you want to restart it?',
             error.message
        );
    }

    /**
     * Displays an error dialog with simple 'restart' or 'shutdown' choice.
     * @param {string} title   - title of the dialog
     * @param {string} message - message shown in the dialog
     * @param {string} details - additional details to be displayed
     */
    static displayRestartDialog(title, message, details = '') {
        dialog.showMessageBox(
            { type: 'error', buttons: ['Restart', 'Shutdown'], title, message, detail: details },
            (response) => {
                if (response === 0) {
                    app.relaunch();
                }
                app.exit(0);
            }
        );
    }

    static dktest() {
        console.log('aaa')
        alert('aaa')
    }
}
