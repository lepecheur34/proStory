-- ============================================================
-- Schéma ProStory — à coller dans Supabase > SQL Editor > Run
-- ============================================================

-- Table profil artisan : renseigné à l'inscription (métier + infos sur son
-- activité). Sert à personnaliser le ton des contenus générés par l'IA.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  metier_id text not null,
  nom_entreprise text,
  ville text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Chacun voit son propre profil"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Chacun crée son propre profil"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Chacun modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = user_id);


-- Table des réalisations (historique synchronisé, remplace/complète
-- l'historique local qui existait avant l'espace client)
create table if not exists public.realisations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  metier_id text not null,
  client_email text,
  description text,
  photo_urls text[] default '{}',
  facebook text,
  instagram text,
  linkedin text,
  email_objet text,
  email_corps text,
  sent_channels text[] default '{}',
  wordpress_url text,
  created_at timestamptz default now()
);

alter table public.realisations add column if not exists wordpress_url text;
-- L'email client est maintenant optionnel à la création (choix fait après,
-- au moment du partage) : sans effet si déjà nullable.
alter table public.realisations alter column client_email drop not null;

alter table public.realisations enable row level security;

create policy "Chacun voit uniquement ses propres réalisations"
  on public.realisations for select
  using (auth.uid() = user_id);

create policy "Chacun crée ses propres réalisations"
  on public.realisations for insert
  with check (auth.uid() = user_id);

create policy "Chacun modifie ses propres réalisations"
  on public.realisations for update
  using (auth.uid() = user_id);

create policy "Chacun supprime ses propres réalisations"
  on public.realisations for delete
  using (auth.uid() = user_id);


-- Table de suivi des connexions réseaux sociaux (statut affiché dans
-- l'écran "Compte"). Le vrai flux OAuth de connexion crée/maj une ligne ici.
create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null check (provider in ('google', 'facebook', 'linkedin', 'wordpress')),
  account_label text,
  review_link text,
  facebook_page_id text,
  facebook_page_name text,
  facebook_page_access_token text,
  instagram_business_id text,
  instagram_username text,
  wordpress_site_url text,
  wordpress_api_key text,
  connected_at timestamptz default now(),
  unique (user_id, provider)
);

-- Si la table existait déjà avant ces ajouts, ces lignes ajoutent les
-- colonnes sans tout recréer (sans effet si déjà présentes).
alter table public.social_connections add column if not exists review_link text;
alter table public.social_connections add column if not exists facebook_page_id text;
alter table public.social_connections add column if not exists facebook_page_name text;
alter table public.social_connections add column if not exists facebook_page_access_token text;
alter table public.social_connections add column if not exists instagram_business_id text;
alter table public.social_connections add column if not exists instagram_username text;
alter table public.social_connections add column if not exists wordpress_site_url text;
alter table public.social_connections add column if not exists wordpress_api_key text;

-- Si la table existait déjà avec l'ancienne contrainte (sans "wordpress"),
-- on la remplace. Sans effet si la contrainte porte déjà le bon nom/contenu.
alter table public.social_connections drop constraint if exists social_connections_provider_check;
alter table public.social_connections
  add constraint social_connections_provider_check
  check (provider in ('google', 'facebook', 'linkedin', 'wordpress'));

alter table public.social_connections enable row level security;

create policy "Chacun voit ses propres connexions"
  on public.social_connections for select
  using (auth.uid() = user_id);

create policy "Chacun gère ses propres connexions"
  on public.social_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- Bucket de stockage pour les photos des réalisations.
-- (À créer aussi depuis Storage > New bucket si l'insert ci-dessous
-- ne suffit pas selon la version de Supabase)
insert into storage.buckets (id, name, public)
values ('realisations-photos', 'realisations-photos', true)
on conflict (id) do nothing;

create policy "Chacun uploade dans son propre dossier"
  on storage.objects for insert
  with check (
    bucket_id = 'realisations-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Photos publiques en lecture"
  on storage.objects for select
  using (bucket_id = 'realisations-photos');
