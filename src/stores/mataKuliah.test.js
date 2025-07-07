import { setActivePinia, createPinia } from 'pinia';
import { useMataKuliahStore } from '../../stores/mataKuliah';
import { useDashboardStore } from '../../stores/dashboard';
import { vi, describe, beforeEach, test, expect } from 'vitest';
import axios from 'axios';

// Mock modul axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

// Mock dashboard store
vi.mock('../../stores/dashboard', () => ({
  useDashboardStore: vi.fn(() => ({
    fetchDashboardSummary: vi.fn(() => Promise.resolve()),
  })),
}));

const apiClient = axios.create();

describe('useMataKuliahStore (JSON-Server)', () => {
  let dashboardStoreMock;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    dashboardStoreMock = useDashboardStore();
  });

  test('fetchMataKuliah mengambil daftar mata kuliah dengan benar', async () => {
    const mockMataKuliah = [
      { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101', userId: 'testUserId' },
      { id: 'mk2', namaMataKuliah: 'SDA', kodeMataKuliah: 'SDA202', userId: 'testUserId' }
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockMataKuliah });

    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');

    expect(apiClient.get).toHaveBeenCalledWith('/mataKuliah?userId=testUserId');
    expect(store.mataKuliahList).toEqual(mockMataKuliah);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  test('fetchMataKuliah menangani error API', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('Network Error'));

    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');

    expect(store.mataKuliahList).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe('Network Error');
  });

  test('addMataKuliah menambahkan mata kuliah baru dan memperbarui state', async () => {
    const newData = { namaMataKuliah: 'Jaringan', kodeMataKuliah: 'JKT303' };
    const responseData = { id: 'newId', ...newData, userId: 'testUserId' };
    apiClient.post.mockResolvedValueOnce({ data: responseData });

    const store = useMataKuliahStore();
    store.mataKuliahList = [];

    const success = await store.addMataKuliah(newData, 'testUserId');

    expect(success).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/mataKuliah', { ...newData, userId: 'testUserId' });
    expect(store.mataKuliahList).toContainEqual(responseData);
    expect(dashboardStoreMock.fetchDashboardSummary).toHaveBeenCalled();
  });

  test('updateMataKuliah memperbarui data dan state', async () => {
    const initial = { id: 'mk1', namaMataKuliah: 'PBK', kodeMataKuliah: 'PBK101', userId: 'testUserId' };
    const updateData = { namaMataKuliah: 'PBK Updated', status: 'Selesai' };
    const responseData = { ...initial, ...updateData };
    apiClient.patch.mockResolvedValueOnce({ data: responseData });

    const store = useMataKuliahStore();
    store.mataKuliahList = [initial];

    const success = await store.updateMataKuliah('mk1', updateData);

    expect(success).toBe(true);
    expect(apiClient.patch).toHaveBeenCalledWith('/mataKuliah/mk1', updateData);
    expect(store.mataKuliahList[0]).toEqual(responseData);
    expect(dashboardStoreMock.fetchDashboardSummary).toHaveBeenCalled();
  });

  test('deleteMataKuliah menghapus data dan memperbarui state', async () => {
    const initialList = [
      { id: 'mk1', namaMataKuliah: 'PBK', userId: 'testUserId' },
      { id: 'mk2', namaMataKuliah: 'SDA', userId: 'testUserId' }
    ];
    apiClient.delete.mockResolvedValueOnce({});

    const store = useMataKuliahStore();
    store.mataKuliahList = initialList;

    const success = await store.deleteMataKuliah('mk1');

    expect(success).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith('/mataKuliah/mk1');
    expect(store.mataKuliahList).toHaveLength(1);
    expect(store.mataKuliahList[0].id).toBe('mk2');
    expect(dashboardStoreMock.fetchDashboardSummary).toHaveBeenCalled();
  });
});
