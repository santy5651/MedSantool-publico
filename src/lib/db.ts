import type { Table } from 'dexie';
import Dexie from 'dexie';
import type { HistoryEntry } from '@/types';

export class MedSanToolsDB extends Dexie {
  history!: Table<HistoryEntry, number>; // number is the type of the primary key 'id'

  constructor() {
    super('MedSanToolsDB');
    this.version(1).stores({
      history: '++id, timestamp, module, status', // Primary key 'id' auto-incrementing
    });
  }
}

export const db = new MedSanToolsDB();
