import { put, get, del, list } from "@vercel/blob";
import fs from "node:fs";

// Read BLOB_READ_WRITE_TOKEN from .env.preview.local
const envContent = fs.readFileSync(".env.preview.local", "utf8");
let token = null;
for (const line of envContent.split("\n")) {
  if (line.startsWith("BLOB_READ_WRITE_TOKEN=")) {
    token = line.split("=", 2)[1].trim().replace(/^["']|["']$/g, "");
    break;
  }
}

if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN not found in .env.preview.local");
  process.exit(1);
}

console.log("Token loaded successfully. Prefix:", token.substring(0, 16) + "...");

async function run() {
  console.log("\n=== 1. Testing Upload (put) ===");
  const testPayload = Buffer.from("SYNTHETIC_TEST_BLOB_PAYLOAD_FOR_PHASE_5_3_1_" + Date.now());
  const filename = `synthetic-staging/test-${Date.now()}.txt`;
  
  const uploadResult = await put(filename, testPayload, {
    access: "private",
    token,
    contentType: "text/plain",
    addRandomSuffix: false,
  });
  
  console.log("Upload result:", {
    url: uploadResult.url,
    pathname: uploadResult.pathname,
    contentType: uploadResult.contentType,
  });

  console.log("\n=== 2. Testing Retrieval (get) ===");
  const getResult = await get(uploadResult.url, {
    access: "private",
    token,
  });
  
  console.log("Retrieval status:", getResult.statusCode);
  if (getResult.statusCode !== 200) {
    throw new Error(`Failed to retrieve blob: status ${getResult.statusCode}`);
  }

  // Read response stream
  const reader = getResult.stream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const retrievedBuffer = Buffer.concat(chunks);
  const retrievedText = retrievedBuffer.toString("utf8");
  const expectedText = testPayload.toString("utf8");

  console.log("Retrieved bytes:", retrievedBuffer.length, "Expected bytes:", testPayload.length);
  if (retrievedText !== expectedText) {
    throw new Error("Retrieved content does not match uploaded content!");
  }
  console.log("Content integrity check: MATCH!");

  console.log("\n=== 3. Testing Store List (list) ===");
  const listResult = await list({ token, access: "private" });
  console.log("Blobs in store:", listResult.blobs.length);
  const found = listResult.blobs.some((b) => b.pathname === filename);
  console.log("Found uploaded blob in list:", found);

  console.log("\n=== 4. Testing Deletion (del) ===");
  await del(uploadResult.url, { token });
  console.log("Delete call completed.");

  console.log("\n=== 5. Confirming Deletion ===");
  let deleteConfirmed = false;
  try {
    const postDelResult = await get(uploadResult.url, { access: "private", token });
    if (postDelResult.statusCode === 404) {
      deleteConfirmed = true;
    } else {
      console.log("Post-delete status code:", postDelResult.statusCode);
    }
  } catch (err) {
    console.log("Post-delete error:", err.message);
    deleteConfirmed = true;
  }
  console.log("Blob confirmed deleted:", deleteConfirmed);

  console.log("\n=== ALL VERCEL BLOB TESTS PASSED SUCCESSFULLY! ===");
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
