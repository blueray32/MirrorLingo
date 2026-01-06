# Code Review: AI Conversation Practice Feature

**Date**: 2026-01-06
**Reviewer**: Kiro CLI
**Scope**: Conversation practice feature (commit fd6325d6)

---

## Stats

- Files Modified: 2 (frontend/src/pages/index.tsx, frontend/tsconfig.tsbuildinfo)
- Files Added: 5 (conversation types, service, handler, hook, component)
- Files Deleted: 0
- New lines: +731
- Deleted lines: -822 (refactoring)

---

## Issues Found

### MEDIUM

```
severity: medium
file: frontend/src/hooks/useConversationApi.ts
line: 37-38
issue: Stale closure in sendMessage callback
detail: The sendMessage callback captures `messages` in its dependency array but uses it inside generateMockResponse. If sendMessage is called rapidly, the messages array may be stale, leading to incorrect history being passed.
suggestion: Use functional update pattern or useRef for messages:
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  // Then use messagesRef.current in sendMessage
```

```
severity: medium
file: frontend/src/hooks/useConversationApi.ts
line: 54-55
issue: Message ID collision possible with rapid sends
detail: Using Date.now().toString() for IDs means two messages sent within the same millisecond will have the same ID. The correction message uses Date.now() + 1 and + 2, but rapid user sends could still collide.
suggestion: Use crypto.randomUUID() or a counter:
  id: crypto.randomUUID()
```

```
severity: medium
file: backend/src/handlers/conversation-handler.ts
line: 21
issue: JSON.parse without try-catch
detail: If event.body contains invalid JSON, the handler will throw an unhandled exception instead of returning a 400 error.
suggestion: Wrap JSON.parse in try-catch:
  let body;
  try { body = JSON.parse(event.body); } 
  catch { return createResponse(400, { error: 'Invalid JSON' }); }
```

### LOW

```
severity: low
file: frontend/src/components/ConversationPractice.tsx
line: 43
issue: onKeyPress is deprecated
detail: React's onKeyPress is deprecated in favor of onKeyDown for better cross-browser compatibility.
suggestion: Change to onKeyDown and check e.key === 'Enter'
```

```
severity: low
file: backend/src/services/conversationService.ts
line: 79
issue: Message history slice may exclude important context
detail: Slicing to last 6 messages is arbitrary and may cut off important conversation context for longer sessions.
suggestion: Consider token-based truncation or make the limit configurable via environment variable.
```

```
severity: low
file: frontend/src/hooks/useConversationApi.ts
line: 5
issue: Unused API_BASE_URL constant
detail: API_BASE_URL is defined but never used since the hook uses mock responses.
suggestion: Either remove the unused constant or add a TODO comment indicating it's for future API integration.
```

---

## Positive Observations

1. **Good error handling** in ConversationService with fallback response
2. **Clean component structure** with clear separation between topic selection and chat views
3. **Proper TypeScript types** for all conversation data structures
4. **Accessibility-friendly** keyboard handling (Enter to send)
5. **Good UX patterns** - typing indicator, auto-scroll, error banner

---

## Summary

Code review passed with no critical or high-severity issues. The conversation practice feature is well-implemented with good patterns. The medium-severity issues are edge cases that won't affect normal demo usage but should be addressed before production.

**Recommendation**: Ready for demo. Fix JSON.parse error handling before production deployment.
