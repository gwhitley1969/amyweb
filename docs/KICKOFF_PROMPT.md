# Kickoff prompt for Claude Code

Paste the following as your first message in Claude Code, from the repo root
containing CLAUDE.md and BUILD_SPEC.md. (Adjust the bracketed line if any
placeholder values are already known.)

---

Read CLAUDE.md and BUILD_SPEC.md in full before doing anything else. This is a
website build for a paying client — a licensed medical-aesthetics nurse
practitioner — and the compliance constraints in those documents are
non-negotiable and enforced by CI gates you will build.

Then, before writing any code:

1. Confirm your understanding in your own words, briefly: the three or four
   constraints most likely to be violated accidentally during this build, and
   how the repo's gates (claims linter, approvals check, layout-injected
   disclaimers, generated SWA configs) prevent each one.

2. Ask me your open questions now, in one batch. Do not ask about anything the
   placeholder registry (BUILD_SPEC §17) already covers — those are tracked
   and will be supplied; use the `{{TOKEN}}` values in the meantime.

3. Propose your Phase A plan (BUILD_SPEC §18): the exact scaffold, file tree,
   pipeline design, and the acceptance test proving Phase A is done. Wait for
   my approval before building.

Known values you can use immediately:
- Domain: needlegirlie.com (canonical apex), www redirects to apex.
- DNS: already hosted in Azure DNS in the client's subscription
  (needlegirlie.onmicrosoft.com tenant).
- Logo assets: Needle_Girlie_Logo_White.png and Needle_Girlie_Logo_Black.png
  (I will place them in the repo — pixel-sample them for the brand palette per
  BUILD_SPEC §5).
- [Add here any {{TOKEN}} values you already have: Vagaro URL, phone, hours,
  social links, Azure region, etc.]

Work one phase at a time. Plan, get my approval, build, run `npm run verify`,
show me the result. Do not start Phase B until Phase A's exit criterion is met
and I've confirmed it.
