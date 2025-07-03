import { setActivePinia, createPinia } from 'pinia';
import { useMataKuliahStore } from './mataKuliah';
import { useDashboardStore } from './dashboard';
import { vi, describe, beforeEach, test, expect } from 'vitest';

// --- Perbaikan: Objek mock akan didefinisikan di sini ---
// Ini adalah objek yang akan kita gunakan untuk mengontrol perilaku mock Firebase
const firebaseMocks = {
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDoc: vi.fn(),
};

// Mock modul firebase/firestore
// Sekarang, factory function vi.mock akan mengembalikan objek mock yang sudah didefinisikan di atas
vi.mock('firebase/firestore', () => ({
  getFirestore: firebaseMocks.getFirestore,
  collection: firebaseMocks.collection,
  doc: firebaseMocks.doc,
  addDoc: firebaseMocks.addDoc,
  getDocs: firebaseMocks.getDocs,
  updateDoc: firebaseMocks.updateDoc,
  deleteDoc: firebaseMocks.deleteDoc,
  query: firebaseMocks.query,
  where: firebaseMocks.where,
  getDoc: firebaseMocks.getDoc,
}));

// Mock modul dashboard secara keseluruhan
vi.mock('./dashboard', () => ({
  useDashboardStore: vi.fn(() => ({
    fetchDashboardSummary: vi.fn(() => Promise.resolve()),
  })),
}));

describe('useMataKuliahStore', () => {
  let dashboardStoreMock;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks(); // Membersihkan semua mock calls sebelum setiap test

    // Reset mock Firestore functions
    firebaseMocks.getFirestore.mockReturnValue({}); // getFirestore biasanya mengembalikan objek db
    firebaseMocks.collection.mockReturnValue({});
    firebaseMocks.doc.mockReturnValue({});
    firebaseMocks.addDoc.mockResolvedValue({ id: 'newId' }); // addDoc mengembalikan DocRef dengan id
    firebaseMocks.getDocs.mockResolvedValue({ docs: [] }); // getDocs mengembalikan QuerySnapshot
    firebaseMocks.updateDoc.mockResolvedValue();
    firebaseMocks.deleteDoc.mockResolvedValue();
    firebaseMocks.query.mockImplementation((collectionRef, ...constraints) => ({ collectionRef, constraints })); // query mengembalikan objek query
    firebaseMocks.where.mockImplementation((field, op, value) => ({ field, op, value })); // where mengembalikan objek constraint
    firebaseMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => undefined }); // getDoc mengembalikan DocSnap

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

    expect(firebaseMocks.getFirestore).toHaveBeenCalled();
    expect(firebaseMocks.collection).toHaveBeenCalledWith({}, "mataKuliah");
    expect(firebaseMocks.where).toHaveBeenCalledWith("userId", "==", "testUserId");
    expect(firebaseMocks.query).toHaveBeenCalled();
    expect(firebaseMocks.getDocs).toHaveBeenCalled();
    expect(store.mataKuliahList).toEqual(mockMataKuliah);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(dashboardStoreMock.fetchDashboardSummary).not.toHaveBeenCalled();
  });

  test('fetchMataKuliah menangani error API', async () => {
    firebaseMocks.getDocs.mockRejectedValueOnce(new Error('Firestore Error'));

    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');

    expect(store.mataKuliahList).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe('Firestore Error');
    expect(dashboardStoreMock.fetchDashboardSummary).not.toHaveBeenCalled();
  });

  test('addMataKuliah menambahkan mata kuliah baru dan memperbarui state', async () => {
    const newMataKuliahData = { namaMataKuliah: 'Jaringan', kodeMataKuliah: 'JKT303' };
    const addedMataKuliah = { id: 'newId', ...newMataKuliahData, userId: 'testUserId' };
    firebaseMocks.addDoc.mockResolvedValueOnce({ id: 'newId' });

    const store = useMataKuliahStore();
    store.mataKuliahList = [];

    const success = await store.addMataKuliah(newMataKuliahData, 'testUserId');

    expect(success).toBe(true);
    expect(firebaseMocks.getFirestore).toHaveBeenCalled();
    expect(firebaseMocks.collection).toHaveBeenCalledWith({}, "mataKuliah");
    expect(firebaseMocks.addDoc).toHaveBeenCalledWith({}, { ...newMataKuliahData, userId: 'testUserId' });
    expect(store.mataKuliahList).toContainEqual(addedMataKuliah);
    expect(dashboardStoreMock.fetchDashboardSummary).toHaveBeenCalledTimes(1);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  test('updateMataKuliah memperbarui mata kuliah dan memperbarui state', async () => {
    const initialMataKuliah = { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101', userId: 'testUserId' };
    const updatedData = { namaMataKuliah: 'PBK Updated', status: 'Selesai' };
    const expectedMataKuliah = { ...initialMataKuliah, ...updatedData };
    firebaseMocks.updateDoc.mockResolvedValueOnce();

    const store = useMataKuliahStore();
    store.mataKuliahList = [{ ...initialMataKuliah }];

    const success = await store.updateMataKuliah('mk1', updatedData, 'testUserId');

    expect(success).toBe(true);
    expect(firebaseMocks.getFirestore).toHaveBeenCalled();
    expect(firebaseMocks.doc).toHaveBeenCalledWith({}, "mataKuliah", 'mk1');
    expect(firebaseMocks.updateDoc).toHaveBeenCalledWith({}, { ...updatedData, userId: 'testUserId' });
    expect(store.mataKuliahList[0]).toEqual(expectedMataKuliah);
    expect(dashboardStoreMock.fetchDashboardSummary).toHaveBeenCalledTimes(1);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  test('deleteMataKuliah menghapus mata kuliah dan memperbarui state', async () => {
    const mataKuliahIdToDelete = 'mk1';
    const testUserId = 'testUserId';
    const initialMataKuliahList = [
      { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101', userId: testUserId },
      { id: 'mk2', namaMataKuliah: 'SDA', kodeMataKuliah: 'SDA202', userId: testUserId }
    ];
    const remainingMataKuliahList = [
      { id: 'mk2', namaMataKuliah: 'SDA', kodeMataKuliah: 'SDA202', userId: testUserId }
    ];
    firebaseMocks.deleteDoc.mockResolvedValueOnce();
    firebaseMocks.getDocs.mockResolvedValueOnce({
      docs: remainingMataKuliahList.map(mk => ({ id: mk.id, data: () => mk }))
    });

    const store = useMataKuliahStore();
    store.mataKuliahList = [...initialMataKuliahList];

    const success = await store.deleteMataKuliah(mataKuliahIdToDelete, testUserId);

    expect(success).toBe(true);
    expect(firebaseMocks.getFirestore).toHaveBeenCalled();
    expect(firebaseMocks.doc).toHaveBeenCalledWith({}, "mataKuliah", mataKuliahIdToDelete);
    expect(firebaseMocks.deleteDoc).toHaveBeenCalled();
    expect(firebaseMocks.getDocs).toHaveBeenCalled();
    expect(store.mataKuliahList).toEqual(remainingMataKuliahList);
    expect(dashboardStoreMock.fetchDashboardSummary).toHaveBeenCalledTimes(1);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });
});
