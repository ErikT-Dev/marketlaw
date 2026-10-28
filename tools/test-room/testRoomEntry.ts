import { startTestRoom } from "./startTestRoom.ts";

const [file, numberText, site = "http://localhost:8787"] = process.argv.slice(2);
if (file === undefined || numberText === undefined) {
  throw new Error("usage: npm run test-room -- <scenario file> <scenario number> [site]");
}
console.log(await startTestRoom(file, Number(numberText), site));
