import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // only if using a preload script
        },
    });

    // Load index.html from Vite's build output (dist folder)
    // The assumption: after running `vite build`, the files go in `dist`.
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
