// lib/forumApi.js
import { supabase } from './supabase';

export async function fetchThreadsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('category_id', categoryId)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchThreadById(id) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addComment({ threadId, text, author }) {
  const { data, error } = await supabase
    .from('forum_comments')
    .insert([{ thread_id: threadId, text, author }]);
  if (error) throw new Error(error.message);
  return data[0];
}

export async function fetchComments(threadId) {
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('thread_id', threadId)
    .order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
export async function fetchForumCategories() {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}