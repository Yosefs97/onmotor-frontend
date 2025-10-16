// lib/articlesApi.js
import { supabase } from './supabase';

export async function fetchAllArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchArticlesByCategory(category) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .order('published_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
