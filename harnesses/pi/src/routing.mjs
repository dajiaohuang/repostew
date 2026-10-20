// Weighted fair dispatch within the highest available priority tier.
// Counters advance at reservation, not at completion. No catch-up flood after cooldown.
export function choosePool(pools, routing, occupied, now = Date.now(), allowed) {
  const eligible=pools.filter(p => p.enabled && (!allowed?.length || allowed.includes(p.id)) &&
    (routing[p.id]?.cooldownUntil ?? 0) <= now && !routing[p.id]?.disabledReason &&
    (occupied[p.id] ?? 0) < p.maxConcurrent);
  if (!eligible.length) return undefined;
  const priority=Math.min(...eligible.map(p => p.priority));
  const tier=eligible.filter(p => p.priority === priority);
  const total=tier.reduce((sum,p)=>sum+p.weight,0);
  const credits={};
  for(const p of tier) credits[p.id]=(routing[p.id]?.credit ?? 0)+p.weight;
  const chosen=tier.reduce((best,p)=>!best || credits[p.id]>credits[best.id] ? p : best,undefined);
  const next=structuredClone(routing);
  for(const p of pools) {
    next[p.id] ??= { credit:0, assignments:0 };
    next[p.id].credit=credits[p.id] ?? 0;
  }
  next[chosen.id].credit-=total;
  next[chosen.id].assignments=(next[chosen.id].assignments ?? 0)+1;
  return { pool:chosen, routing:next };
}

export function classifyProviderFailure(message, now=Date.now()) {
  const text=String(message);
  if (/\b(429|rate.?limit|quota exceeded|too many requests)\b/i.test(text)) {
    const seconds=text.match(/retry[- ]after\s*[:=]?\s*(\d+)/i)?.[1];
    return { kind:'rate-limit', cooldownUntil:now+(seconds ? Math.max(1,Number(seconds))*1000 : 60000) };
  }
  if (/\b(401|403|invalid.?api.?key|authentication failed|unauthorized)\b/i.test(text)) return { kind:'authentication', disabledReason:'authentication failure: owner must repair credentials' };
  if (/\b(500|502|503|504|overloaded|ECONNRESET|ETIMEDOUT)\b/i.test(text)) return { kind:'transient', cooldownUntil:now+30000 };
  return { kind:'execution' };
}
