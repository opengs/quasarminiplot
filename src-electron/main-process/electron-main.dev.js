/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

import electronDebug from 'electron-debug'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { app, BrowserWindow } from 'electron'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-floating-promises
app.whenReady().then(() => {
  // allow for a small delay for mainWindow to be created
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  setTimeout(() => {
    // Install `electron-debug` with `devtron`
    electronDebug({ showDevTools: false })

    // Install vuejs devtools
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    installExtension(VUEJS_DEVTOOLS)
      .then(name => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Added Extension: ${name}`)
        // get main window
        const win = BrowserWindow.getFocusedWindow()
        if (win) {
          win.webContents.on('did-frame-finish-load', () => {
            win.webContents.once('devtools-opened', () => {
              win.webContents.focus()
            })
            // open electron debug
            console.log('Opening dev tools')
            win.webContents.openDevTools()
          })
        }
      })
      .catch(err => {
        console.log('An error occurred: ', err)
      })
  }, 250)
})

import './electron-main'
