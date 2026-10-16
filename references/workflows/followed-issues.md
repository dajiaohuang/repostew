# Followed-issue execution

1. Read all heading-named followed groups; deduplicate union once, preserve memberships/overlap.
   Apply followed filters only here, not to new work, notifications or authored patrol.
2. Use saved global through time + overlap, freeze UTC upper bound; first scan needs explicit start.
   Fully paginate creation-time issues, excluding PRs. Disabled issues means none; source failure does not.
3. Complete/deduplicate each repository input before assigning its nonempty batch under
   [orchestration](../orchestration.md); independent complete batches need not wait for the entire union.
   Supply window/links/facts/authority/resources; Worker investigates affected paths via [delivery](delivery.md),
   without full audit or repeating source capture. Capture-only work needs no source checkout, repair tests
   or publication checks; metadata-only dispositions reuse relevant evidence. Refill authorized slots
   from captured work, no pre-investigation or new schedule.
4. Avoid existing notification/fallback/Worker writers; merge through authorized communication or defer
   with retained links/reason. Trust usable finals; clarify material outcomes with the original Worker only.
5. Retain every unresolved object before advancing one global time. Entire union must be fetched and handled/
   reliably retained; any fetch failure keeps old time. Coordinator updates positions/navigation, not membership.
   The global time gate does not block engineering on independently complete inputs. Recover missing
   capture evidence locally first; fill only unrecoverable/failed portions within the assigned window.
   Retry from live facts/deduplicated state; no stored bodies, inferred resolution or navigation-only coverage.
