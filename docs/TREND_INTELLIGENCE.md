# Trend Intelligence

The intelligence desk never treats model memory as live news. Every current-event signal must retain a source URL, source name and publication timestamp.

## Separation of facts and opinion
Source headline/summary describes the underlying development. Elyrac Angle is stored separately and represents Elyrac's interpretation or business implication. The UI must not blur these together.

## Verification
Ingested signals start unverified. Only verified signals may be passed directly into campaign evidence. This prevents a trend headline from becoming a company claim or fabricated breaking story.

## Intended connector flow
Public/current information retrieval -> normalization -> source/freshness validation -> relevance scoring -> human or trusted verification -> Elyrac angle -> Content Strategist.
