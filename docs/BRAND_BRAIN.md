# Elyrac Brand Brain

The Brand Brain is persistent company memory for marketing decisions. It separates durable brand rules from evidence that can support factual content.

## Durable core
- Positioning and promise
- Brand colors and visual constraints
- Content worlds
- Approval and authenticity guardrails

## Evidence
Internal project facts, product releases, founder observations, case-study facts and approved company updates belong in brand_evidence. Evidence is not usable by agents until approved.

## CEO learning
Approval feedback can be saved as a durable rule only when rememberAsRule is explicitly true. A one-off edit therefore does not silently become permanent brand policy.

## Safety
Approval is a state transition, not a publish action. Publishing remains a separate future integration and may only consume approved campaigns.
