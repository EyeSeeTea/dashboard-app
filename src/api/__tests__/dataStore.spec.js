import { apiGetDataStoreValue, apiReadDataStoreValue } from '../dataStore.js'

describe('data store reads', () => {
    const setup = () => ({ query: jest.fn(), mutate: jest.fn() })

    it('reads an existing entry directly without writing', async () => {
        const engine = setup()
        engine.query.mockResolvedValue({ settings: { enabled: true } })
        expect(await apiReadDataStoreValue('settings', engine)).toEqual({
            enabled: true,
        })
        expect(engine.query).toHaveBeenCalledWith({
            settings: { resource: 'dataStore/dashboard/settings' },
        })
        expect(engine.mutate).not.toHaveBeenCalled()
    })

    it('leaves missing-entry handling to the caller without creating it', async () => {
        const engine = setup()
        const error = new Error('Not found')
        engine.query.mockRejectedValue(error)
        await expect(apiReadDataStoreValue('settings', engine)).rejects.toBe(
            error
        )
        expect(engine.mutate).not.toHaveBeenCalled()
    })

    it('preserves get-or-create behavior for existing callers when the key is absent', async () => {
        const engine = setup()
        engine.query.mockResolvedValue({ dataStore: [] })
        expect(await apiGetDataStoreValue('savedFilters', [], engine)).toEqual(
            []
        )
        expect(engine.mutate).toHaveBeenCalledWith({
            resource: 'dataStore/dashboard/savedFilters',
            type: 'create',
            data: [],
        })
    })

    it('preserves existing value reads for get-or-create callers', async () => {
        const engine = setup()
        engine.query
            .mockResolvedValueOnce({ dataStore: ['dashboard'] })
            .mockResolvedValueOnce({ keys: ['savedFilters'] })
            .mockResolvedValueOnce({ savedFilters: [{ id: 'saved1' }] })
        expect(await apiGetDataStoreValue('savedFilters', [], engine)).toEqual([
            { id: 'saved1' },
        ])
        expect(engine.mutate).not.toHaveBeenCalled()
    })
})
