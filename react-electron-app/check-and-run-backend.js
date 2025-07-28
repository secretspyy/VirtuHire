const { execFile } = require("child_process");
const net = require("net");

const PORT = 8000;
const HOST = "127.0.0.1";
const BACKEND_EXECUTABLE = "./backend/dist/start_backend.exe";

const server = net.createServer();
server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.log(`⚠️ Port ${PORT} already in use. Backend may already be running.`);
    } else {
        console.error("❌ Unexpected error:", err);
    }
});
server.once("listening", () => {
    server.close();
    console.log("✅ Port is free. Launching backend...");
    execFile(BACKEND_EXECUTABLE, (error) => {
        if (error) {
            console.error("❌ Failed to start backend:", error);
        }
    });
});
server.listen(PORT, HOST);
