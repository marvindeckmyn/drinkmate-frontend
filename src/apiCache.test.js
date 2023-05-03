import { setCache, getCache, clearCache } from './apiCache';

describe('apiCache', () => {
  afterEach(() => {
    clearCache();
  });

  test('sets and gets cache', () => {
    const key = 'testKey';
    const data = { value: 'testValue' };

    setCache(key, data);
    const cachedData = getCache(key);

    expect(cachedData).toEqual(data);
  });

  test('clears cache', () => {
    const key1 = 'testKey1';
    const data1 = { value: 'testValue1' };
    const key2 = 'testKey2';
    const data2 = { value: 'testValue2' };

    setCache(key1, data1);
    setCache(key2, data2);

    clearCache();

    expect(getCache(key1)).toBeUndefined();
    expect(getCache(key2)).toBeUndefined();
  });
});