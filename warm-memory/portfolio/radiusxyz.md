# RadiusXYZ

**Last researched:** 2026-03-03

## Company Overview
Decentralized shared sequencing layer for Ethereum rollups. Focused on trustless sequencing infrastructure to eliminate centralized sequencer risks.

## Technology & Product

### Core Problem Addressed
In rollups, **single centralized sequencers** create risks:
- Censorship power
- Harmful MEV extraction
- Single point of failure
- Monopoly control over block ordering

### Radius Solution
**Trustless shared sequencing layer** that provides:
- **Decentralized sequencing** across multiple rollups
- **Fast finality** guarantees
- **Enhanced security** vs centralized alternatives
- **Simplified interoperability** between rollups

### Technical Architecture
- **Order commitment** via hash chaining before decryption
- Time-lock puzzles for transaction ordering
- Sequencer generates commitment even before resolving puzzles
- Prevents sequencer from manipulating order for MEV

### Portico Testnet
- **Active testnet** documentation available
- Block signing process:
  - Takes empty transaction lists
  - Current timestamp
  - Block height
  - Sequencer private key
  - Rollup type
  - Signs block officially

## Market Position
- **Institutional focus**: "Powering next generation of institutional adoption"
- Suite of products creating sustainable economic utility for decentralized systems
- Positioned in competitive shared sequencing space (vs Espresso, Astria, etc.)

## Funding
- **Seed: .7M** raised
- Well-capitalized for early-stage infrastructure play

## Strategic Assessment
✅ **Solid technical foundation**:
- Clear value prop addressing real rollup pain point
- Active development (testnet live)
- Institutional positioning smart for this infra layer
- Seed funding sufficient for current stage

⏳ **Early stage** - Success depends on:
- Rollup adoption of shared sequencing
- Competition from other sequencing layers
- Ethereum scaling roadmap alignment

## Status
🟢 **Active development** - Product in testnet, clear technical approach, well-funded for early stage. Monitor rollup partnerships and mainnet timeline.