import { platform } from "node:os";

export async function openInDefaultBrowser(filePath: string): Promise<void> {
  const os = platform();
  const command =
    os === "darwin"
      ? ["open", filePath]
      : os === "win32"
        ? ["cmd", "/c", "start", "", filePath]
        : ["xdg-open", filePath];

  const process = Bun.spawn(command, { stdout: "ignore", stderr: "ignore" });
  await process.exited;
}
