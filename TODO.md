# TODO: Modify User Info to Track Per-Session Stats

## Tasks
- [ ] Modify AuthContext.tsx to change userStats structure to per-session
- [ ] Update incrementResumeCreated and incrementResumeAnalyzed functions to use sessionId
- [ ] Update BuildResume.tsx to pass current sessionId to incrementResumeCreated
- [ ] Update ATSAnalyzer.tsx to pass current sessionId to incrementResumeAnalyzed
- [ ] Update UserInfo.tsx to display per-session stats instead of aggregated per-email
- [ ] Test the changes to ensure separate session tracking works

## Notes
- Current userStats is global per email, need to make it per session
- Sessions already have unique IDs, can use session.user.id or create session-specific stats
- Need to ensure backward compatibility with existing data
