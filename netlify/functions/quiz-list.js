const { store, adminOnly } = require("./_utils");

exports.handler = async (event, context) => {
  const { isAdmin } = adminOnly(context);
  if (!isAdmin) return { statusCode: 401, body: "Unauthorized" };
  const s = await store();
  const list = await s.list();
  const out = [];
  for (const b of (list.blobs || [])) {
    const v = await s.get(b.key, { type: "json" });
    if (v) out.push(v);
  }
  out.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  return { statusCode: 200, headers:{ "Content-Type":"application/json" }, body: JSON.stringify(out) };
};


