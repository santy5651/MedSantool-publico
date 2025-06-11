import type { Table } from 'dexie';
import Dexie from 'dexie';
import type { HistoryEntry } from '@/types';

export class MedInsightDB extends Dexie {
  history!: Table<HistoryEntry, number>; // number is the type of the primary key 'id'

  constructor() {
    super('MedInsightDB');
    this.version(1).stores({
      history: '++id, timestamp, module, status', // Primary key 'id' auto-incrementing
    });
  }
}

export const db = new MedInsightDB();
