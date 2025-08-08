const { store, adminOnly } = require("./_utils");

exports.handler = async (event, context) => {
  const { isAdmin } = adminOnly(context);
  if (!isAdmin) return { statusCode: 401, body: "Unauthorized" };
  try{
    const id = (event.queryStringParameters && event.queryStringParameters.id) || null;
    if (!id) return { statusCode: 400, body: "Missing id" };
    const s = await store();
    await s.delete(id);
    return { statusCode: 200, headers:{"Content-Type":"application/json"}, body: JSON.stringify({ ok:true }) };
  }catch(e){
    return { statusCode: 500, body: "Server Error" };
  }
};


