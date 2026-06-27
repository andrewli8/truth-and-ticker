<!-- looptight:session-loop:start -->
## Looptight session loop

When asked to improve this repository autonomously:

1. Read `docs/STATUS.md`, then run `looptight next --json`.
2. If the status is `task`, implement only that grounded task in this session.
3. Run `looptight verify --json`; only `pass` authorizes a commit.
4. Review the diff, update `docs/STATUS.md` by replacement rather than logging,
   commit the coherent change, push when authorized, and repeat from step 1.
5. On `no_work` carrying a `generate_ideas` directive, add 1-6 grounded tasks
   as a numbered list (each with `Evidence: relative/path[:line]` and an
   observable `Acceptance:`; `-` bullets are not parsed) to the `## Next`
   section of `docs/STATUS.md` per that directive, then repeat
   from step 1. Stop successfully when no evidence-backed improvement exists,
   when idea generation is disabled (`--no-ideas` or `idea_generation = false`),
   or on a `next` error or validator `timeout` / `error`.

Do not run `looptight run` or `looptight improve` from this workflow: those
launch child agents. `next` and `verify` make no model or API calls and use this
already-running session; the provider controls authentication and billing.
<!-- looptight:session-loop:end -->

<!-- looptight:goal-loop:start -->
## Looptight goal loop

When a build goal is active (set with `looptight goal "<vision>"`):

1. Run `looptight goal next --json`.
2. If the status is `active`, build exactly the one increment its directive
   describes, in this session. On an empty project, the first increment scaffolds
   the project and a test command so later steps are gated.
3. Run `looptight verify --json`; only `pass` authorizes a commit. Commit the
   coherent increment.
4. Repeat from step 1 until the status is `done` or `stop`, or the session usage is
   spent. `looptight goal clear` ends the goal.

`goal next` and `verify` make no model or API calls; this already-running session
does the building. For hands-off runs use `looptight goal "<vision>" --continuous`.
<!-- looptight:goal-loop:end -->
