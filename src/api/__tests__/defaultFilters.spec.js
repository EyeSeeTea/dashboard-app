import { apiGetDefaultFilters } from '../defaultFilters.js'

describe('dashboard default filters', () => {
    const configuration = { dashboard1: { pe: [{ id: 'TODAY' }] } }

    it('reads optional configuration once without writing', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValue({ defaultFilters: configuration }),
        }
        expect(await apiGetDefaultFilters(engine)).toEqual(configuration)
        await apiGetDefaultFilters(engine)
        expect(engine.query).toHaveBeenCalledTimes(1)
        expect(engine.query).toHaveBeenCalledWith({
            defaultFilters: { resource: 'dataStore/dashboard/defaultFilters' },
        })
    })

    it('allows viewing dashboards if configuration is missing or inaccessible', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Unavailable')),
        }
        expect(await apiGetDefaultFilters(engine)).toEqual({})
        await apiGetDefaultFilters(engine)
        expect(engine.query).toHaveBeenCalledTimes(1)
    })
})
