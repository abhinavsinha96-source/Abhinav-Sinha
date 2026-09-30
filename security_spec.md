# Security Specification: Haven

## 1. Data Invariants
- Direct messages require `senderId` to be the authenticated user and `recipientId` to be a valid user ID.
- Users can only edit or delete their own profiles (`userId == request.auth.uid`).
- Users can create stories where `authorId == request.auth.uid`, and only the author can update or delete their story.
- Friend requests must have `fromUserId == request.auth.uid`. Only recipient or sender can update request status.
- Notifications are private and can only be read or modified by the owner (`userId == request.auth.uid`).
- Encrypted payloads and vault strings have strict upper bounds to prevent denial-of-wallet.

## 2. Dirty Dozen Payloads & Attack Scenarios
1. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile update.
2. **Author Spoofing**: Submitting a story with `authorId: "victim_id"` while authenticated as attacker.
3. **Impersonated DM**: Sending an encrypted message where `senderId != request.auth.uid`.
4. **Eavesdropping DM**: Reading direct messages where user is neither sender nor recipient.
5. **PII / Vault Breach**: Attempting to read another user's encrypted vault or private notification collection.
6. **Story Tampering**: Non-author attempting to delete or overwrite another user's story.
7. **Friend Request Hijack**: Approving a friend request where user is neither recipient nor sender.
8. **Mega-Payload Exhaustion**: Injecting a 2MB base64 string into `title` or `displayName`.
9. **Invalid Document ID Injection**: Accessing paths with invalid Unicode or 2KB IDs.
10. **Unauthenticated Write**: Submitting messages or stories without `request.auth`.
11. **Status Tampering**: Altering friend request status to arbitrary strings.
12. **Notification Snooping**: Reading another user's in-app notification feed.
