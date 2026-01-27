// Supabase API integration for the frontend
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase configuration is missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your environment.');
}

/**
 * Get the Supabase client instance
 */
export const getSupabaseClient = () => {
  return supabase;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, userData = {}) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { data: listener } = supabase.auth.onAuthStateChange(callback);
  return listener;
};

/**
 * Fetch data from Supabase table
 */
export const fetchDataFromTable = async (tableName, filters = {}) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  let query = supabase.from(tableName).select('*');
  
  // Apply filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      query = query.eq(key, filters[key]);
    }
  });
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Insert data into a Supabase table
 */
export const insertIntoTable = async (tableName, data) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { data: insertedData, error } = await supabase
    .from(tableName)
    .insert(data);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return insertedData;
};

/**
 * Update data in a Supabase table
 */
export const updateInTable = async (tableName, data, id) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { data: updatedData, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('id', id);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return updatedData;
};

/**
 * Delete data from a Supabase table
 */
export const deleteFromTable = async (tableName, id) => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(error.message);
  }
};