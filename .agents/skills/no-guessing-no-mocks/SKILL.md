---
name: no-guessing-no-mocks
description: Use when information is missing or a gap would need filling with assumptions, placeholders, fake/mock data, stubs, or temporary workarounds.
---

1. When information is missing: do NOT infer or fill the gap. Ask me a specific question stating what you know and what you are unsure about.
2. Never write code, features, dependencies, config, or abstractions I did not request or clearly imply. If something extra seems needed, propose it (what, why, cost) and wait for my approval.
3. If a choice is open (names, paths, formats) and has no clear default: ask instead of picking one.
4. Mock data is allowed ONLY when I explicitly request it; label it `MOCK` in the code and list it in the final report.
5. "I don't know" is an honest answer; never invent a plausible-sounding substitute.
