const { store, adminOnly } = require("./_utils");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const { isAdmin } = adminOnly(context);
  if (!isAdmin) return { statusCode: 401, body: "Unauthorized" };
  try{
    const body = JSON.parse(event.body || "{}");
    if (!body.id) return { statusCode: 400, body: "Missing id" };
    const s = await store();
    const current = await s.get(body.id, { type: "json" });
    if (!current) return { statusCode: 404, body: "Not found" };
    const next = { ...current, ...(body.patch||{}), updatedAt: new Date().toISOString() };
    await s.set(body.id, JSON.stringify(next));
    return { statusCode: 200, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ok:true }) };
  }catch(e){
    return { statusCode: 500, body: "Server Error" };
  }
};


