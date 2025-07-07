import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMataKuliahStore } from './mataKuliah';

// Mock apiClient dan dashboardStore
vi.mock('../utils/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
import apiClient from '../utils/apiClient';

vi.mock('./dashboard', () => ({
  useDashboardStore: () => ({
    fetchDashboardSummary: vi.fn().mockResolvedValue(),
  }),
}));

describe('useMataKuliahStore (JSON-Server)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('fetchMataKuliah mengambil daftar mata kuliah dengan benar', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: [{ id: 'mk1', nama: 'Matkul 1' }],
    });

    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');

    expect(apiClient.get).toHaveBeenCalledWith('/mataKuliah?userId=testUserId');
    expect(store.mataKuliahList).toEqual([{ id: 'mk1', nama: 'Matkul 1' }]);
  });

  it('fetchMataKuliah menangani error API', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('API Error'));
    const store = useMataKuliahStore();
    await store.fetchMataKuliah('testUserId');
    expect(store.error).toBe('API Error');
  });

  it('addMataKuliah menambahkan mata kuliah baru dan memperbarui state', async () => {
    const store = useMataKuliahStore();
    const newData = { nama: 'Matkul Baru' };
    const mockResponse = {
      data: { id: 'mk2', nama: 'Matkul Baru', userId: 'testUserId' },
    };
    apiClient.post.mockResolvedValueOnce(mockResponse);

    const result = await store.addMataKuliah(newData, 'testUserId');

    expect(result).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/mataKuliah', {
      ...newData,
      userId: 'testUserId',
    });
    expect(store.mataKuliahList).toContainEqual(mockResponse.data);
  });

  it('updateMataKuliah memperbarui data dan state', async () => {
    const store = useMataKuliahStore();
    store.mataKuliahList = [{ id: 'mk1', nama: 'Lama' }];
    const updateData = { nama: 'Baru' };
    const responseData = { id: 'mk1', nama: 'Baru' };
    apiClient.patch.mockResolvedValueOnce({ data: responseData });

    const result = await store.updateMataKuliah('mk1', updateData);

    expect(result).toBe(true);
    expect(apiClient.patch).toHaveBeenCalledWith('/mataKuliah/mk1', updateData);
    expect(store.mataKuliahList[0]).toEqual(responseData);
  });

  it('deleteMataKuliah menghapus data dan memperbarui state', async () => {
    const store = useMataKuliahStore();
    store.mataKuliahList = [
      { id: 'mk1', nama: 'Matkul 1' },
      { id: 'mk2', nama: 'Matkul 2' },
    ];

    apiClient.delete.mockResolvedValueOnce(); // bisa kosong
    const result = await store.deleteMataKuliah('mk1');

    expect(result).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith('/mataKuliah/mk1');
    expect(store.mataKuliahList).toEqual([{ id: 'mk2', nama: 'Matkul 2' }]);
  });
});
