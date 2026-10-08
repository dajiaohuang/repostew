# custom-components/places

For [PR #508](https://github.com/custom-components/places/pull/508), successful lookup
mocks must populate `ATTR_OSM_DICT` after the update path began rolling back on empty
OSM responses. Test retry behavior through the real tracker-coordinate refresh and
snapshot rollback: verify previous state and coordinates are restored after failure,
then verify the next attempt reaches lookup at the same tracker coordinates. The
maintainer described stale visible sensor data after rollback as a useful, nonblocking
follow-up; keep it out of this narrowly scoped fix.
