const { getStore } = require("@netlify/blobs");

function adminOnly(context){
  const user = context.clientContext && context.clientContext.user;
  const roles = (user && user.app_metadata && user.app_metadata.roles) || [];
  const isAdmin = roles.includes("admin");
  return { user, isAdmin };
}

function uid(){ return (Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)).toUpperCase(); }

async function store(){ return getStore("quiz-submissions"); }

module.exports = { adminOnly, uid, store };


