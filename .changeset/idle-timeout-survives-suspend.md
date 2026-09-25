---
"@ai-hero/sandcastle": patch
---

Measure the agent idle timeout in host-awake time. A gap of more than 10 seconds between samples of the wall clock is treated as a host suspend (such as a laptop lid closing) and not counted, so a run no longer fails with `AgentIdleTimeoutError` after the machine wakes. Idle warnings and the post-completion grace window run off the same clock, so warnings no longer arrive in a burst on wake and the grace window does not close early.
