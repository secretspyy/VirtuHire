const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = !app.isPackaged;

let backendProcess;

function getBackendPath() {
    if (app.isPackaged) {
        // In production, from extraResources (sibling to app.asar)
        return path.join(process.resourcesPath, 'start_backend.exe');
    } else {
        // In development
        return path.join(__dirname, '..', 'backend', 'dist', 'start_backend.exe');
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Load correct URL or file
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools(); // open devtools in dev
    } else {
        win.loadFile(path.join(__dirname, '../build/index.html'));
        win.webContents.openDevTools(); // open devtools in prod too temporarily
    }

    // Show any errors from renderer
    win.webContents.on('console-message', (_, level, message, line, sourceId) => {
        console.log(`Renderer log: ${message} (source: ${sourceId}:${line})`);
    });
}


app.whenReady().then(() => {
    // ✅ Start backend correctly based on env
    const backendPath = getBackendPath();
    backendProcess = spawn(backendPath, [], {
        cwd: path.dirname(backendPath), // ✅ Set correct working dir
        shell: true                     // ✅ Handles path + .exe execution properly on Windows
    });


    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });

    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
