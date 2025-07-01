import { useState, useEffect } from 'react';
import { SalesRecord } from '../types/sales';

interface OfflineStorage {
  savePendingSale: (sale: Omit<SalesRecord, 'id' | 'createdAt'>) => Promise<void>;
  getPendingSales: () => Promise<SalesRecord[]>;
  clearPendingSales: () => Promise<void>;
  isSupported: boolean;
}

export const useOfflineStorage = (): OfflineStorage => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('indexedDB' in window);
    
    if ('indexedDB' in window) {
      initializeDB();
    }
  }, []);

  const initializeDB = () => {
    const request = indexedDB.open('SalesTrackerDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('pendingSales')) {
        const store = db.createObjectStore('pendingSales', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('date', 'date', { unique: false });
      }
    };
    
    request.onerror = () => {
      console.error('Failed to initialize IndexedDB');
    };
  };

  const savePendingSale = async (sale: Omit<SalesRecord, 'id' | 'createdAt'>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SalesTrackerDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pendingSales'], 'readwrite');
        const store = transaction.objectStore('pendingSales');
        
        const saleWithTimestamp = {
          ...sale,
          createdAt: new Date(),
          synced: false,
        };
        
        const addRequest = store.add(saleWithTimestamp);
        
        addRequest.onsuccess = () => {
          resolve();
        };
        
        addRequest.onerror = () => {
          reject(addRequest.error);
        };
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const getPendingSales = async (): Promise<SalesRecord[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SalesTrackerDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pendingSales'], 'readonly');
        const store = transaction.objectStore('pendingSales');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const clearPendingSales = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SalesTrackerDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pendingSales'], 'readwrite');
        const store = transaction.objectStore('pendingSales');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          resolve();
        };
        
        clearRequest.onerror = () => {
          reject(clearRequest.error);
        };
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  return {
    savePendingSale,
    getPendingSales,
    clearPendingSales,
    isSupported,
  };
};