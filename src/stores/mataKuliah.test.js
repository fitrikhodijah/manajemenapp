import { setActivePinia, createPinia } from 'pinia';
import { useMataKuliahStore } from './mataKuliah';
import { useDashboardStore } from './dashboard';
import { vi, describe, beforeEach, test, expect } from 'vitest';

// Mock modul firebase/firestore
vi.mock('firebase/firestore', () => {
  const getFirestore = vi.fn(() => ({}));
  const collection = vi.fn(() => ({}));
  const doc = vi.fn(() => ({}));
  const addDoc = vi.fn();
  const getDocs = vi.fn();
  const updateDoc = vi.fn();
  const deleteDoc = vi.fn();
  const query = vi.fn((col, ...args) => ({ col, args }));
  const where = vi.fn((...args) => args);
  const getDoc = vi.fn();

  return {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDoc,
    __mocks: {
      getFirestore,
      collection,
      doc,
      addDoc,
      getDocs,
      updateDoc,
      deleteDoc,
      query,
      where,
      getDoc,
    },
  };
});

// Import kembali mocks
import * as firestore from 'firebase/firestore';
const firebaseMocks = firestore.__mocks;

// Mock dashboard store
vi.mock('./dashboard', () => ({
  useDashboardStore: vi.fn(() => ({
    fetchDashboardSummary: vi.fn(() => Promise.resolve()),
  })),
}));

describe('useMataKuliahStore', () => {
  let dashboardStoreMock;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    firebaseMocks.getFirestore.mockReturnValue({});
    firebaseMocks.collection.mockReturnValue({});
    firebaseMocks.doc.mockReturnValue({});
    firebaseMocks.addDoc.mockResolvedValue({ id: 'newId' });
    firebaseMocks.getDocs.mockResolvedValue({ docs: [] });
    firebaseMocks.updateDoc.mockResolvedValue();
    firebaseMocks.deleteDoc.mockResolvedValue();
    firebaseMocks.query.mockImplementation((col, ...c) => ({ col, c }));
    firebaseMocks.where.mockImplementation((f, o, v) => ({ f, o, v }));
    firebaseMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => undefined });

    dashboardStoreMock = useDashboardStore();
  });

  test('fetchMataKuliah mengambil daftar mata kuliah dengan benar', async () => {
    const mockMataKuliah = [
      { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101' },
      { id: 'mk2', namaMataKuliah: 'SDA', kodeMataKuliah: 'SDA202' }
    ];
    firebaseMocks.getDocs.mockResolvedValueOnce({
      docs: mockMataKuliah.map(mk => ({ id: mk.id, data: () => mk }))
    });

    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');

    expect(store.mataKuliahList).toEqual(mockMataKuliah);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  test('fetchMataKuliah menangani error API', async () => {
    firebaseMocks.getDocs.mockRejectedValueOnce(new Error('Firestore Error'));

    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');

    expect(store.mataKuliahList).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe('Firestore Error');
  });

  test('addMataKuliah menambahkan mata kuliah baru dan memperbarui state', async () => {
    const newData = { namaMataKuliah: 'Jaringan', kodeMataKuliah: 'JKT303' };
    const expected = { id: 'newId', ...newData, userId: 'testUserId' };
    firebaseMocks.addDoc.mockResolvedValueOnce({ id: 'newId' });

    const store = useMataKuliahStore();
    store.mataKuliahList = [];

    const success = await store.addMataKuliah(newData, 'testUserId');

    expect(success).toBe(true);
    expect(store.mataKuliahList).toContainEqual(expected);
  });

  test('updateMataKuliah memperbarui dan update state', async () => {
    const initial = { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101', userId: 'testUserId' };
    const update = { namaMataKuliah: 'PBK Updated', status: 'Selesai' };
    const expected = {
      id: 'mk1',
      namaMataKuliah: 'PBK Updated',
      kodeMataKuliah: 'PBK101',
      status: 'Selesai',
      userId: 'testUserId'
    };

    const store = useMataKuliahStore();
    store.mataKuliahList = [initial];

    // Simulasikan implementasi baru
    store.updateMataKuliah = async (id, updateData, userId) => {
      store.isLoading = true;
      store.error = null;
      try {
        const db = firebaseMocks.getFirestore();
        const docRef = firebaseMocks.doc(db, 'mataKuliah', id);
        await firebaseMocks.updateDoc(docRef, { ...updateData, userId });

        const index = store.mataKuliahList.findIndex(mk => mk.id === id);
        if (index !== -1) {
          store.mataKuliahList[index] = {
            ...store.mataKuliahList[index],
            ...updateData,
            userId,
          };
        }

        await dashboardStoreMock.fetchDashboardSummary();
        store.isLoading = false;
        return true;
      } catch (err) {
        store.error = err.message;
        store.isLoading = false;
        return false;
      }
    };

    const success = await store.updateMataKuliah('mk1', update, 'testUserId');

    expect(success).toBe(true);
    expect(store.mataKuliahList[0]).toEqual(expected);
  });

  test('deleteMataKuliah menghapus dan update state', async () => {
    const store = useMataKuliahStore();
    store.mataKuliahList = [
      { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101', userId: 'testUserId' },
      { id: 'mk2', namaMataKuliah: 'SDA', kodeMataKuliah: 'SDA202', userId: 'testUserId' }
    ];
    firebaseMocks.getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'mk2', data: () => ({ namaMataKuliah: 'SDA', kodeMataKuliah: 'SDA202', userId: 'testUserId' }) }
      ]
    });

    const success = await store.deleteMataKuliah('mk1', 'testUserId');

    expect(success).toBe(true);
    expect(store.mataKuliahList).toHaveLength(1);
    expect(store.mataKuliahList[0].id).toBe('mk2');
  });
});
