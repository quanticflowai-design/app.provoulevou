import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── AUTH ─────────────────────────────────────────────
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── USERS ────────────────────────────────────────────
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export const createUserProfile = async (userId, email) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: userId, email, plano: 'starter', fotos_usadas: 0 }])
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateUserPlan = async (userId, plano) => {
  const { data, error } = await supabase
    .from('users')
    .update({ plano })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const incrementFotosUsadas = async (userId) => {
  const { data, error } = await supabase.rpc('increment_fotos_usadas', { uid: userId })
  if (error) throw error
  return data
}

// ─── TROCAS ───────────────────────────────────────────
export const getTrocas = async (userId) => {
  const { data, error } = await supabase
    .from('trocas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
  if (error) throw error
  return data || []
}

export const createTroca = async (trocaData) => {
  const { data, error } = await supabase
    .from('trocas')
    .insert([trocaData])
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── CLIENTES ─────────────────────────────────────────
export const getClientes = async (userId) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', userId)
    .order('ultima_troca', { ascending: false })
  if (error) throw error
  return data || []
}

export const upsertCliente = async (clienteData) => {
  const { data, error } = await supabase
    .from('clientes')
    .upsert([clienteData], { onConflict: 'whatsapp,user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── PLANOS ───────────────────────────────────────────
export const PLANOS = {
  starter: { nome: 'Pacote Starter', preco: 97, limite: 50 },
  inicial: { nome: 'Pacote Inicial', preco: 197, limite: 100 },
  medio: { nome: 'Pacote Médio', preco: 397, limite: 500 },
  premium: { nome: 'Pacote Premium', preco: 797, limite: 1200 },
}

export const getLimitePlano = (plano) => PLANOS[plano]?.limite || 50

// ─── SQL SETUP (copy to Supabase SQL editor) ──────────
export const SQL_SETUP = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plano TEXT NOT NULL DEFAULT 'starter' CHECK (plano IN ('starter','inicial','medio','premium')),
  fotos_usadas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trocas table
CREATE TABLE IF NOT EXISTS trocas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  altura INTEGER NOT NULL,
  peso INTEGER NOT NULL,
  foto_resultado TEXT,
  tamanho TEXT,
  data TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  compras INTEGER DEFAULT 0,
  ultima_troca TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, whatsapp)
);

-- Planos table (reference)
CREATE TABLE IF NOT EXISTS planos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  preco INTEGER NOT NULL,
  limite_fotos INTEGER NOT NULL
);

INSERT INTO planos VALUES
  ('starter','Pacote Starter',97,50),
  ('inicial','Pacote Inicial',197,100),
  ('medio','Pacote Médio',397,500),
  ('premium','Pacote Premium',797,1200)
ON CONFLICT (id) DO NOTHING;

-- RPC to increment fotos_usadas
CREATE OR REPLACE FUNCTION increment_fotos_usadas(uid UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users SET fotos_usadas = fotos_usadas + 1 WHERE id = uid;
END;
$$;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trocas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own trocas" ON trocas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own clientes" ON clientes FOR ALL USING (auth.uid() = user_id);
`
