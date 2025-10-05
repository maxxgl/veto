# Veto - Restaurant Selection Tool

## Overview

A collaborative selection tool where friends take turns vetoing options until one remains. Inspired by childhood movie selection, this approach ensures everyone has input while delighting the group with a mutually acceptable solution.

## Core Concept

When friends are deciding where to eat, the traditional approach often leads to:

- One person dominating the conversation
- Endless debates and compromises
- Unhappy participants settling for suboptimal choices

**Veto** solves this by:

1. Gathering all available restaurant options in a given area
2. Having each participant veto one option per round
3. Continuing rounds until only one restaurant remains
4. Providing surprising, consensus-driven results where everyone had fair input

## Core Mechanics

### The Veto Process

1. Generate a list of restaurants in a given area
2. Each participant takes turns vetoing one restaurant
3. Continue until only one option remains
4. The remaining restaurant is the group's choice

### Why This Works

- **Fair input**: Everyone removes options they dislike
- **No dominance**: Single participants can't override the result
- **Emergent behavior**: Results are often surprising to all participants
- **Satisfaction**: Everyone feels they had meaningful input in the decision

## Key Features

- Turn-based elimination system
- Restaurant discovery/listing by area
- Multi-participant session management
- Visual feedback on vetoed options
- Clear indication of whose turn it is

## Technical Stack

- **Framework**: SvelteKit 2 + Svelte 5
- **Database**: SQLite with Kysely
- **Styling**: Tailwind + DaisyUI
- **Testing**: Vitest (unit) + Playwright (e2e)

## User Flow

1. Create a new session
2. Invite friends (share link/code)
3. Load restaurants for target area
4. Take turns vetoing options
5. Reveal final selection
