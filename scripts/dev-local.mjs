import { spawn } from "node:child_process";
import net from "node:net";

const HOST = "127.0.0.1";
const PORT = 3000;

function isPortInUse() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: HOST, port: PORT });
    socket.setTimeout(800);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
  });
}

if (await isPortInUse()) {
  console.log(`dev server already running on http://${HOST}:${PORT}`);
  process.exit(0);
}

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--hostname", HOST, "--port", String(PORT)],
  { stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  if (signal) {
    console.log(`dev server stopped by ${signal}`);
  }
  process.exit(code ?? 0);
});
