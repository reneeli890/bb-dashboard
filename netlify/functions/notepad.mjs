import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("notepad");

  if (req.method === "GET") {
    const content = await store.get("content") || "";
    const version = await store.get("version") || "0";
    return Response.json({ content, version: parseInt(version) });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const currentVersion = parseInt(await store.get("version") || "0");
    const newVersion = currentVersion + 1;
    await store.set("content", body.content);
    await store.set("version", String(newVersion));
    return Response.json({ content: body.content, version: newVersion });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/notepad",
};
