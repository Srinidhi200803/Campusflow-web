import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Setter<T> = (v: T[] | ((prev: T[]) => T[])) => void;

interface UseCollectionResult<T> {
  data: T[];
  setData: Setter<T>;
  loading: boolean;
  error: string | null;
  insert: (row: Omit<T, 'id'> & Partial<Pick<T, 'id'>>) => Promise<T | null>;
  update: (id: string, patch: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * Synchronizes a per-user Supabase table with local React state.
 * The caller owns the optimistic `setData` updates; this hook wires them
 * through to the database with proper error handling.
 */
export function useCollection<T extends { id: string }>(
  table: string,
  userId: string | null | undefined,
  rowToDb: (row: T) => Record<string, unknown>,
  dbToRow: (row: Record<string, unknown>) => T,
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: true }
): UseCollectionResult<T> {
  const [data, setDataState] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const skipFetch = useRef(false);

  useEffect(() => {
    if (!userId) {
      setDataState([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: rows, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order(orderBy.column, { ascending: orderBy.ascending ?? true });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setDataState([]);
      } else {
        setError(null);
        setDataState((rows as Record<string, unknown>[]).map(dbToRow));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId]);

  const setData = useCallback<Setter<T>>((v) => {
    setDataState(v);
  }, []);

  const insert = useCallback(
    async (row: Omit<T, 'id'> & Partial<Pick<T, 'id'>>) => {
      const payload = { ...rowToDb(row as T) };
      const { data: created, error: insertError } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .maybeSingle();
      if (insertError) {
        setError(insertError.message);
        return null;
      }
      if (created) {
        const newRow = dbToRow(created as Record<string, unknown>);
        skipFetch.current = true;
        setDataState((prev) => [...prev, newRow]);
        return newRow;
      }
      return null;
    },
    [table, rowToDb, dbToRow]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      const dbPatch = rowToDb({ ...({} as T), ...patch } as T);
      // Only send the fields that actually changed
      const keys = Object.keys(patch) as (keyof T)[];
      const partialDb: Record<string, unknown> = {};
      for (const k of keys) {
        if (k in dbPatch) partialDb[k as string] = dbPatch[k as string];
      }
      const { error: updateError } = await supabase
        .from(table)
        .update(partialDb)
        .eq('id', id);
      if (updateError) setError(updateError.message);
    },
    [table, rowToDb]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      if (deleteError) setError(deleteError.message);
    },
    [table]
  );

  return { data, setData, loading, error, insert, update, remove };
}
