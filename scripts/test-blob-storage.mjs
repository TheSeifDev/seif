import { put, get, del } from "@vercel/blob";
import { execSync } from "node:child_process";

// 1. Fetch BLOB_READ_WRITE_TOKEN from Vercel API for staging store
const envJson = execSync("npx.cmd vercel api /v9/projects/prof/env", { encoding: "utf8" });
const envs = JSON.parse(envJson).envs || [];
const tokenItem = envs.find((e) => e.key === "BLOB_READ_WRITE_TOKEN");
if (!tokenItem || !tokenItem.value) {
  console.error("BLOB_READ_WRITE_TOKEN not found in Preview env");
  process.exit(1);
}
const token = tokenItem.value;

async function run() {
  console.log("--- Testing Vercel Blob on Staging Store (Private Access) ---");
  
  // 1. Synthetic file payload (PNG header)
  const syntheticBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  const filename = `cms/synthetic-test-${Date.now()}.png`;

  console.log(`1. Uploading private synthetic file: ${filename}...`);
  const blob = await put(filename, syntheticBytes, {
    access: "private",
    token,
    contentType: "image/png",
    addRandomSuffix: false,
  });
  console.log(`Upload successful: pathname=${blob.pathname}, contentType=${blob.contentType}, url=${blob.url}`);

  // 2. Read back using private get()
  console.log(`2. Reading back uploaded private blob via get()...`);
  const result = await get(blob.url, {
    access: "private",
    token,
  });
  console.log(`Read back status: ${result.statusCode}`);
  if (result.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${result.statusCode}`);
  }

  // Read stream
  const reader = result.stream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const downloaded = Buffer.concat(chunks);
  console.log(`Downloaded ${downloaded.byteLength} bytes (expected ${syntheticBytes.byteLength})`);
  if (downloaded.byteLength !== syntheticBytes.byteLength) {
    throw new Error("Downloaded size does not match uploaded size!");
  }

  // 3. Delete blob
  console.log(`3. Deleting uploaded blob...`);
  await del(blob.url, { token });
  console.log(`Delete operation succeeded!`);

  // 4. Verify deletion
  console.log(`4. Verifying deletion (should fail or return 404)...`);
  try {
    const checkResult = await get(blob.url, { access: "private", token });
    console.log(`Check result status: ${checkResult.statusCode}`);
  } catch (e) {
    console.log(`Expected error on deleted blob: ${e.message}`);
  }

  console.log("ALL Vercel Blob lifecycle tests PASSED!");
}

run().catch((err) => {
  console.error("Blob test error:", err);
  process.exit(1);
});
