-- Run in the Supabase SQL editor. Server connects with a DB role; RLS on + no policies blocks the public anon API.
create table if not exists decks (id text primary key, title text not null, creator text default 'seed');
create table if not exists cards (
  id text primary key, deck_id text references decks(id) on delete cascade, position int default 0,
  title text not null, image_url text, audio_url text, transcript text not null,
  tags text[] default '{}', version int default 1);
create table if not exists card_links (
  id bigserial primary key, from_card text references cards(id) on delete cascade,
  from_start int not null, from_end int not null,   -- seconds if the card has audio_url, else transcript characters
  to_card text references cards(id) on delete cascade, to_start int default 0,
  to_version int default 1, label text);
create table if not exists learning_events (
  id bigserial primary key, anon_id text not null, client_id text not null, assign_id text, problem_id text,
  step int, option_id text, misconception text, correct boolean, created_at timestamptz default now(),
  unique (anon_id, client_id));
create index if not exists ev_anon on learning_events(anon_id);
create index if not exists links_to on card_links(to_card);
alter table decks enable row level security; alter table cards enable row level security;
alter table card_links enable row level security; alter table learning_events enable row level security;

insert into decks values ('algebra','Algebra basics','seed'),('weimar','Weimar Republic','seed'),('inflation','Inflation','seed') on conflict do nothing;
insert into cards (id,deck_id,title,transcript,tags) values
('undo-ops','algebra','Undoing an operation',
 'To get x alone, undo what was done to it. If five was added, subtract five from both sides. Adding again only makes the equation bigger. Always do the same thing to both sides.',
 '{wrong-inverse,one-side}'),
('divide-coef','algebra','Dividing by the coefficient',
 'When x is multiplied by a number, divide both sides by that number. Multiplying again moves you further away. Subtracting the coefficient does nothing useful.',
 '{sub-coefficient,wrong-inverse}'),
('weimar-crash','weimar','The 1929 crash and 1933',
 'The Weimar Republic was already fragile. Hyperinflation in 1923 had wiped out savings. Then the 1929 crash ended foreign loans, unemployment rose, and by 1933 the republic collapsed.',
 '{history}'),
('inflation-1','inflation','What is inflation',
 'Inflation means prices rise, so each unit of money buys less. In 1923 Germany printed money to pay debts and prices doubled within days. Savings became worthless.',
 '{economics}')
on conflict do nothing;
-- link: chars 60-95 of weimar-crash ("Hyperinflation in 1923 had wiped out savings") -> inflation-1
insert into card_links (from_card,from_start,from_end,to_card,to_start,label)
select 'weimar-crash',70,125,'inflation-1',0,'Inflation explained' where not exists (select 1 from card_links);
