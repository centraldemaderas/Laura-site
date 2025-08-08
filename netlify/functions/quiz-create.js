const { store, uid } = require("./_utils");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  try{
    const body = JSON.parse(event.body || "{}");
    const s = await store();
    const id = uid();
    const doc = { id, ...body, createdAt: new Date().toISOString(), archived: false, notes: "" };
    await s.set(id, JSON.stringify(doc));
    return { statusCode: 200, headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ ok:true, id }) };
  }catch(e){
    return { statusCode: 500, body: "Server Error" };
  }
};


