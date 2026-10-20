# Personal-computer fleet foundation

One governance owner, multiple individually enrolled computers. Windows, Linux,
and macOS use the same Node 24 control entry. OpenSSH carries commands over stdin;
each computer retains its own loopback service, runtime database, Pi credentials,
repository files and task process ownership. No public HTTP listener is added.

## Readiness

- The fleet control/registration/receipt layer is implemented for all three OSes.
- Windows execution keeps the existing private kill-on-close Job Object owner.
- Linux/macOS have a process-group owner, **not full descendant containment**.
  Its receipt deliberately leaves `treeStopped=false`, even after successful
  group cleanup. Such runs remain UNKNOWN in the existing engine. Do not deploy
  unattended production C/W there until a native containment adapter and native
  acceptance establish the required stop contract. Doctor exposes this limit.
- No remote hosts, SSH accounts, production assignments, background listeners,
  startup tasks or firewall rules are created by installing these files.
- Source-level portability and fixture tests do not prove a real Linux/macOS host,
  SSH connection, provider login, or cross-machine execution worked.

## Prepare each computer

1. Install Node 24, Python 3, the pinned Pi version used by this harness, RTK and
   OpenSSH. Install dependencies with `rtk npm ci --ignore-scripts`. Copy the
   harness source, agents, scripts, package manifests and the applicable skill
   bundle; never copy another computer's runtime, credential store or work tree.
2. Copy `config.example.json` to `config.local.json` and set local absolute paths:
   `workspace`, `workRoot`, `runtimeDir`, `piCli`; set `python` to `python3` on
   Linux/macOS. Set that machine's capacities/provider pools. Each machine has
   its own runtime directory. Use a private OS account for credentials and state.
3. Enroll once (exclusive create, never overwrites an identity):

   ```text
   rtk node scripts/fleet.mjs enroll config.local.json windows-1
   ```

   Use `linux-1` or `mac-1` on the other machines. Run the service in a visible
   foreground terminal for the first check:

   ```text
   rtk node src/cli.mjs serve --config config.local.json
   ```

   This does not resume work. `start` also supports detached POSIX startup; no
   auto-login/startup registration is installed. Ctrl+C requests owned shutdown.
4. Set up an SSH host alias on the governance computer and verify its host key
   against the target machine. The fleet uses BatchMode and StrictHostKeyChecking;
   it never accepts an unknown key automatically. Windows SSH uses PowerShell;
   Linux/macOS use POSIX shell quoting. Node may need an absolute path because
   noninteractive SSH sessions do not load interactive shell PATH settings.

## Register and inspect from the governance computer

Copy `fleet.example.json` to a private `fleet.local.json`; change only actual host
aliases and absolute remote paths. Run from this harness directory:

```text
rtk node scripts/fleet.mjs doctor fleet.local.json windows-1
rtk node scripts/fleet.mjs status fleet.local.json windows-1
rtk node scripts/fleet.mjs watch fleet.local.json windows-1
```

Doctor verifies the enrolled ID/OS and reports Node/Python/containment capability.
Status returns the existing governance summary, not a second task database. SSH
keys and local service tokens are never sent in command JSON. SSH grants the OS
account's normal rights: this is a trusted personal-machine transport, not a
multi-tenant security sandbox.

`watch` streams metadata JSONL tagged with the machine ID from the node's existing
SSE event stream. It creates no model task, timer or polling loop. Disconnect
terminates the reader; use `status` to reconcile before reconnecting. This stream
is advisory, not durable delivery/acknowledgment of a model report. Node-native
durable subscriptions remain authoritative for actual governance delivery.

## Give a project and work to one machine

Save `project.json` as an exact native identity:

```json
{"host":"github.com","namespace":"example","repo":"project"}
```

```text
rtk node scripts/fleet.mjs claim fleet.local.json windows-1 project.json
rtk node scripts/fleet.mjs command fleet.local.json windows-1 operation.json
```

`operation.json` uses the existing `{requestId,command}` governance schema (see
`GOVERNANCE.md` in the installed harness). Supported C creation requires explicit
`allowedProjects`, empty `allowedHosts`, and claims for every project. W dispatch
requires its project claim. C is created paused. Resume names one registered C/W;
global resume is intentionally rejected. Local engine capacity and authorization
rules still apply. A fleet owner ID is unique across the fleet.

The initial release permits a single governance writer and pins project placement.
There is no automatic discovery spread, task migration, release, claim timeout,
failover, or replay. Its scope covers work assigned through this fleet entry;
existing/local-bypass work must be inventoried before enrolling production scopes.
Workers created inside a C remain managed by that native C and its node; the
fleet journal does not duplicate their engine state. Use that node's native
governance tools for per-worker management of these internally created workers.

## Disconnect and restart

```text
rtk node scripts/fleet.mjs receipt fleet.local.json windows-1 ORIGINAL_REQUEST_ID
rtk node scripts/fleet.mjs registry fleet.local.json
```

The operation is fsynced locally before transport. A timeout leaves UNKNOWN and
keeps ownership. Sending the same command again only returns the journal entry;
it never resends. Receipt reads the node's original engine receipt. `not-found`
does not authorize a retry. Changed payload/machine for an ID is rejected. Node
connection configuration is pinned after its first claim/command; do not casually
change an alias or directory to point at a different runtime.

If the governance process crashes while holding `.fleet/fleet.lock`, retain the
journal and inspect the recorded process and remote receipt before manually
removing that exact stale lock. Never start a second governance writer or delete
the journal to retry. Command signatures are stored instead of request bodies,
but returned receipts may contain task/report details: keep `.fleet` private.

Project transfer is deliberately a later explicit workflow: source writer stop,
unknown effects reconciliation, material transfer and destination acceptance.
Offline does not imply stopped. Existing per-node native event subscriptions stay
available; aggregate push into the one governance conversation is a subsequent
integration step, not something claimed by these command/receipt foundations.

## Verification

```text
rtk npm run check
rtk npm test
```

The gateway integration test uses a real isolated local HTTP service and stdio
gateway without launching a model. Fleet tests cover uncertain delivery, restart,
receipt lookup, identity drift, project collisions, explicit C scope, journal
single-writer exclusion and OS command quoting. Native POSIX owner test only runs
on Linux/macOS; native Job tests only run on Windows. Never count skips as passes.
