# Scheduling and publishing boundary

The content calendar is an editorial planning tool. It does not publish.

Only campaigns already in the CEO-approved state may be scheduled. Scheduling changes the campaign state to scheduled and stores a timestamp. It does not call a social platform API.

The publishing endpoint is intentionally disabled until platform connectors, token handling, platform capability checks, retries, audit logs and a final explicit publish-authorization gate are implemented.

This separation prevents an approval or calendar action from accidentally sending content live.
