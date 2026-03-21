import { getStore } from "@netlify/blobs";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export default async (req) => {
  const store = getStore("notepad");
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || getTodayDate();

  // List all dates that have notepad entries
  if (req.method === "GET" && url.searchParams.get("list") === "true") {
    const { blobs } = await store.list();
    const dates = [...new Set(
      blobs
        .map(b => b.key)
        .filter(k => k.startsWith("content:"))
        .map(k => k.replace("content:", ""))
    )].sort().reverse();
    return Response.json({ dates });
  }

  if (req.method === "GET") {
    const content = await store.get(`content:${date}`) || "";
    const version = await store.get(`version:${date}`) || "0";
    return Response.json({ content, version: parseInt(version), date });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const currentVersion = parseInt(await store.get(`version:${date}`) || "0");
    const newVersion = currentVersion + 1;
    await store.set(`content:${date}`, body.content);
    await store.set(`version:${date}`, String(newVersion));
    return Response.json({ content: body.content, version: newVersion, date });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/notepad",
};
