# Nexus Platform Database Schema

This repository contains the database schema for the Nexus Platform - an all-in-one creative and strategic operations platform powered by Echo AI.

## Schema Overview

The database schema is organized into several key areas:

### Core Tables
- **Users & Authentication**: User accounts, profiles, and subscription management
- **Content Management**: Content items, projects, and timeline clips
- **AI Models & Workflows**: AI model definitions and workflow templates

### Echo AI
- **Learning System**: User interactions tracking, pattern recognition, and insights generation
- **Personalization**: User preferences and style profiles

### Marketplace
- **Items & Purchases**: Marketplace items, reviews, and purchase records
- **Collections & Wishlists**: Curated collections and user wishlists

### Social Media Management
- **Accounts & Posts**: Connected social accounts and scheduled posts
- **Campaigns & Calendars**: Social media campaigns and content calendars
- **Analytics & Listening**: Performance tracking and social listening

### Analytics
- **Dashboards & Widgets**: Custom analytics dashboards and visualization widgets
- **Reports & Metrics**: Scheduled reports and stored metrics

### Support Center
- **Knowledge Base**: Articles, categories, and user feedback
- **Community Forum**: Questions, answers, and community engagement
- **Support Tickets**: User support requests and conversations

## Security

The schema implements comprehensive security using Supabase Row Level Security (RLS):

- Each table has appropriate RLS policies
- Data access is restricted based on ownership
- Role-based permissions for different user types

## Installation

1. Create a new Supabase project
2. Run the migration files in the following order:
   - `create_initial_schema.sql`
   - `add_echo_ai_schema.sql`
   - `add_marketplace_schema.sql`
   - `add_analytics_schema.sql`
   - `add_social_media_schema.sql`
   - `add_support_schema.sql`

## Local Development: Database Seeding

After running `supabase db reset`, you can seed your local database with initial data:

```
npm run seed
```

This will execute `supabase/seed.sql` using the Supabase CLI. Edit `supabase/seed.sql` to add or update your seed data as needed.

- The seed script is safe to run multiple times (uses `on conflict do nothing` for idempotency).
- For creating test users, use the Supabase dashboard or authentication API, not direct SQL.

## Automated User Creation

To create test users in your local Supabase instance, run:

```
npm run seed:users
```

This uses the Supabase Admin API and requires `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file. The script will create users and you can then link their UUIDs in `supabase/seed.sql` for workspace memberships.

- After running `seed:users`, check the output for user UUIDs and update `workspace_memberships` in `seed.sql` if needed.
- You can automate this further by extending the user seed script to insert memberships via the API.

## Entity Relationship Diagram

[View the ERD diagram](https://dbdiagram.io/d/nexus-platform-schema)

## License

This schema is proprietary and confidential.