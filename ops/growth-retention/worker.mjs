export async function prune(database) {
  return database.batch([
    database.prepare("DELETE FROM growth_events WHERE day < date('now','-60 days')"),
    database.prepare('DELETE FROM growth_quotas WHERE expires < ?').bind(Math.floor(Date.now()/60000)),
  ]);
}
export default {
  async scheduled(_event, env) { await prune(env.EIDOS_GROWTH_DB); },
  fetch() { return new Response('Not found', { status: 404 }); },
};
