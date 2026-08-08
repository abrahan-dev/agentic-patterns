import { open, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { roleSchema } from "../domain/schemas.ts";

const runDirectory = process.argv[2];
const role = roleSchema.parse(process.argv[3]);

if (!runDirectory) {
  throw new Error("Usage: watch-role <run-directory> <role>");
}

const logPath = resolve(runDirectory, "logs", `${role}.log`);
let offset = 0;
const colors = {
  specifier: "35",
  architect: "34",
  "ui-designer": "35",
  "data-engineer": "36",
  "backend-coder": "33",
  "frontend-coder": "34",
  qa: "32",
} as const;
const color = colors[role];
console.log(`\u001b[1;${color}m╭──────────────────────────────────────────────╮`);
console.log(`│  WEB APP DEV TEAM · ${role.toUpperCase().padEnd(22)}│`);
console.log("╰──────────────────────────────────────────────╯\u001b[0m");
console.log("Waiting for the development loop to start...\n");

while (true) {
  const info = await stat(logPath);

  if (info.size > offset) {
    const file = await open(logPath, "r");
    const buffer = Buffer.alloc(info.size - offset);
    await file.read(buffer, 0, buffer.length, offset);
    await file.close();
    process.stdout.write(buffer);
    offset = info.size;
  }

  await Bun.sleep(250);
}
