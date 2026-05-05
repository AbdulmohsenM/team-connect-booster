-- Seed data for the retention prototype.
-- Run this once in the Supabase SQL Editor for project uckoiaddlkyusiaokwer.
-- Safe to re-run: clears the seeded rows first.

begin;

delete from public.signals
  where account_id in (select id from public.accounts where id in
    ('11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     '33333333-3333-3333-3333-333333333333',
     '44444444-4444-4444-4444-444444444444',
     '55555555-5555-5555-5555-555555555555'));

delete from public.actions
  where account_id in (select id from public.accounts where id in
    ('11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     '33333333-3333-3333-3333-333333333333',
     '44444444-4444-4444-4444-444444444444',
     '55555555-5555-5555-5555-555555555555'));

delete from public.accounts where id in
  ('11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   '33333333-3333-3333-3333-333333333333',
   '44444444-4444-4444-4444-444444444444',
   '55555555-5555-5555-5555-555555555555');

-- Accounts ---------------------------------------------------------------
insert into public.accounts
  (id, team, plan, seats, owner_name, owner_role, owner_avatar,
   days_since_signup, risk_score, trend, top_reason, mrr,
   quote_text, quote_source, quote_channel)
values
  ('11111111-1111-1111-1111-111111111111', 'Acme Robotics', 'Business', 14,
   'Priya Shah', 'Eng Manager', 'PS', 6, 92, 'up',
   'Solo workspace — 0 of 14 seats invited', 420,
   'I spent twenty minutes trying to figure out how to add my team. I gave up and went back to Asana for the day.',
   'Priya S., Acme Robotics', 'Intercom reply, day 4'),
  ('22222222-2222-2222-2222-222222222222', 'Northwind Studio', 'Business', 8,
   'Marcus Lee', 'Head of Ops', 'ML', 11, 78, 'up',
   '1 invite sent, never accepted — owner stalled', 240,
   'My designer never got the invite — said it went to spam. I haven''t had time to chase it.',
   'Marcus L., Northwind Studio', 'NPS survey, day 9'),
  ('33333333-3333-3333-3333-333333333333', 'Globex Logistics', 'Business', 22,
   'Hana Okafor', 'PMO Lead', 'HO', 19, 71, 'flat',
   'High activity, but only 2 of 22 seats invited', 1760,
   'I''m using it as a personal to-do list. Rolling it out to the whole PMO scares me — I don''t want to be the support desk.',
   'Hana O., Globex Logistics', 'Customer interview, day 17'),
  ('44444444-4444-4444-4444-444444444444', 'Fern & Co.', 'Starter', 4,
   'Sam Rivera', 'Founder', 'SR', 3, 64, 'up',
   'Bounced after seeing the empty dashboard', 49,
   'Honestly I logged in, saw a blank screen, and had no idea where to start. Felt like homework.',
   'Sam R., Fern & Co.', 'Cancellation flow draft, day 3'),
  ('55555555-5555-5555-5555-555555555555', 'Vertex Capital', 'Business', 12,
   'Daniel Cho', 'COO', 'DC', 24, 58, 'down',
   'Recovering — 3 invites sent yesterday', 360,
   'Took us a while but we''re getting there. The Gantt view finally clicked for our IC meetings.',
   'Daniel C., Vertex Capital', 'Support ticket, day 22');

-- Signals ----------------------------------------------------------------
insert into public.signals (account_id, label, detail, weight, position) values
  ('11111111-1111-1111-1111-111111111111','No teammates invited','0 of 14 paid seats activated after 6 days','high',0),
  ('11111111-1111-1111-1111-111111111111','0 tasks created','Owner opened the app 4 times, never created a task','high',1),
  ('11111111-1111-1111-1111-111111111111','Watched onboarding video, bounced','Dropped at step 2 of 4 (Invite team)','med',2),

  ('22222222-2222-2222-2222-222222222222','1 invite sent, 0 accepted','Sent to designer@northwind on day 2, expired','high',0),
  ('22222222-2222-2222-2222-222222222222','3 tasks created, then silent for 6 days','Last activity Apr 14','high',1),
  ('22222222-2222-2222-2222-222222222222','No project template chosen','Still on default ''My Tasks'' view','low',2),

  ('33333333-3333-3333-3333-333333333333','Only 2 of 22 seats used','$1,760/mo paid for unused seats','high',0),
  ('33333333-3333-3333-3333-333333333333','Owner created 47 tasks solo','No assignees — collaboration risk','med',1),
  ('33333333-3333-3333-3333-333333333333','Hit Slack integration paywall, didn''t upgrade','Day 12','low',2),

  ('44444444-4444-4444-4444-444444444444','0 tasks created','2 sessions, both <90 seconds','high',0),
  ('44444444-4444-4444-4444-444444444444','Hovered on ''Invite'' but didn''t click','Session replay, day 1','med',1),

  ('55555555-5555-5555-5555-555555555555','3 new invites sent in last 24h','Trend reversing','low',0),
  ('55555555-5555-5555-5555-555555555555','Still no recurring projects','Industry benchmark: 2 by day 21','med',1);

-- Actions ----------------------------------------------------------------
insert into public.actions (account_id, title, preview, channel, expected_lift, is_recommended, position) values
  ('11111111-1111-1111-1111-111111111111','Send 1-click invite link Priya can forward',
    'Hi Priya — noticed you''re rolling out solo. I generated a pre-filled invite link for your 13 teammates so you can drop it in Slack. Want me to also pull names from your Google Workspace?',
    'in-app nudge','+41% 90-day retention for accounts that invite ≥1 teammate by day 7', true, 0),
  ('11111111-1111-1111-1111-111111111111','Offer Google Workspace import',
    'One-click sync to pull all 14 teammates from Acme''s directory.','email','+28%', false, 1),
  ('11111111-1111-1111-1111-111111111111','Book a 15-min team setup call',
    'Calendly link with the onboarding specialist who closed Acme''s deal.','email','+33%', false, 2),

  ('22222222-2222-2222-2222-222222222222','Resend invite + nudge designer directly',
    'Resend the expired invite to designer@northwind from a no-reply@yourcompany address (better deliverability), and ping Marcus that it''s been re-sent.',
    'email','+22% 90-day retention when stalled invite is recovered', true, 0),
  ('22222222-2222-2222-2222-222222222222','Suggest the Creative Agency template',
    'Pre-built workflow matching Northwind''s industry (set during signup).','in-app nudge','+14%', false, 1),

  ('33333333-3333-3333-3333-333333333333','Send Hana the team rollout kit',
    'Pre-written Slack announcement, a 5-min Loom for her teammates, and an offer to white-glove the first project import. Removes the ''I''ll be the support desk'' fear directly.',
    'email','+36% retention on accounts with <20% seat activation', true, 0),
  ('33333333-3333-3333-3333-333333333333','Assign a CSM (account is >$1.5K MRR)',
    'Trigger the white-glove path normally reserved for Enterprise.','email','+45%', false, 1),

  ('44444444-4444-4444-4444-444444444444','Auto-load the ''Solo Founder'' starter board',
    'Pre-populate 6 sample tasks Sam can edit instead of facing a blank canvas. Triggered on next login with a one-line explainer.',
    'in-app nudge','+29% activation when first-task friction is removed', true, 0),
  ('44444444-4444-4444-4444-444444444444','Personal email from the founder',
    'Short, plain-text ''how can I help you get started?'' from the CEO.','email','+18%', false, 1),

  ('55555555-5555-5555-5555-555555555555','No action — monitor for 7 days',
    'Risk is trending down on its own. Re-evaluate Apr 27.','in-app nudge','Avoid intervention fatigue', true, 0),
  ('55555555-5555-5555-5555-555555555555','Send the ''Recurring Projects'' tip',
    'Lightweight in-app tip, no human touch needed.','in-app nudge','+8%', false, 1);

commit;
