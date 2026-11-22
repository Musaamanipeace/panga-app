---
name: blocked-commands
description: Use when a command fails or cannot be run (permissions, auth, network, interactive prompt, environment): never skip the step silently.
---

1. If a command fails or cannot be run: do NOT skip it or route around the step.
2. First try a working alternative that achieves the same result without changing scope; if one exists, use it and tell me.
3. If none exists: give me the exact command, tell me what to look for, and ask me to paste the output. Wait for it.
4. Never claim a command succeeded or a test passed without actual output showing it.
