import { apiFetchDashboard } from '../../api/fetchDashboard.js'
import itemFilters, {
    msGetNamedItemFilters,
} from '../../reducers/itemFilters.js'
import savedFilters, { buildSavedFilters } from '../../reducers/savedFilters.js'
import selected from '../../reducers/selected.js'
import {
    tSetSelectedDashboardById,
    tSetSelectedDashboardByIdOffline,
} from '../selected.js'

jest.mock('../../api/fetchDashboard.js', () => ({
    apiFetchDashboard: jest.fn(),
}))

describe('dashboard entry defaults', () => {
    const setup = (initial = {}) => {
        let state = {
            selected: {},
            itemFilters: {},
            savedFilters: savedFilters(undefined, {}),
            dimensions: [],
            ...initial,
        }
        const engine = {
            query: jest.fn().mockResolvedValue({
                defaultFilters: { target: { pe: [{ id: 'TODAY' }] } },
            }),
        }
        const dispatch = (action) => {
            if (typeof action === 'function') {
                return action(dispatch, () => state, engine)
            }
            state = {
                ...state,
                selected: selected(state.selected, action),
                itemFilters: itemFilters(state.itemFilters, action),
                savedFilters: savedFilters(state.savedFilters, action),
            }
        }
        apiFetchDashboard.mockImplementation(async (_engine, id) => ({
            id,
            dashboardItems: [],
        }))
        return {
            load: (id, options) =>
                dispatch(tSetSelectedDashboardById(id, undefined, options)),
            loadOffline: (id) => dispatch(tSetSelectedDashboardByIdOffline(id)),
            getState: () => state,
            engine,
        }
    }

    it('applies defaults before rendering and supports badges and saving before dimensions load', async () => {
        const app = setup()
        await app.load('target')
        expect(app.getState().itemFilters).toEqual({
            pe: [{ id: 'TODAY', name: 'Today' }],
        })
        expect(msGetNamedItemFilters(app.getState())[0].name).toBeTruthy()
        expect(buildSavedFilters(app.getState())[0].values[0].id).toBe('TODAY')
    })

    it('preserves a changed or cleared selection on same-dashboard reload', async () => {
        for (const filters of [
            {},
            { pe: [{ id: 'LAST_MONTH', name: 'Last month' }] },
        ]) {
            const app = setup({
                selected: { id: 'target' },
                itemFilters: filters,
            })
            await app.load('target')
            expect(app.getState().itemFilters).toEqual(filters)
            expect(app.engine.query).not.toHaveBeenCalled()
        }
    })

    it('clears defaults on leaving and reapplies on returning, using cached configuration', async () => {
        const app = setup()
        await app.load('target')
        await app.load('other')
        expect(app.getState().itemFilters).toEqual({})
        await app.load('target')
        expect(app.getState().itemFilters.pe[0].id).toBe('TODAY')
        expect(app.engine.query).toHaveBeenCalledTimes(1)
    })

    it('does not apply cached defaults when revisiting a dashboard offline', async () => {
        const app = setup()
        await app.load('target')
        await app.load('other')
        await app.load('target', { online: false })
        expect(app.getState().selected.id).toBe('target')
        expect(app.getState().itemFilters).toEqual({})
        expect(app.engine.query).toHaveBeenCalledTimes(1)
    })

    it('does not read configuration offline and retries normally when entering online', async () => {
        const app = setup()
        await app.load('target', { online: false })
        expect(app.getState().itemFilters).toEqual({})
        expect(app.engine.query).not.toHaveBeenCalled()
        await app.load('other', { online: false })
        await app.load('target')
        expect(app.getState().itemFilters.pe[0].id).toBe('TODAY')
    })

    it.each(['online', 'cachedOffline', 'uncachedOffline'])(
        'resets the active saved filter on %s dashboard switches',
        async (mode) => {
            const app = setup({
                selected: { id: 'other' },
                itemFilters: { pe: [{ id: 'LAST_MONTH', name: 'Last month' }] },
                savedFilters: {
                    ...savedFilters(undefined, {}),
                    active: { id: 'saved1', dashboardId: 'other' },
                },
            })
            if (mode === 'uncachedOffline') {
                app.loadOffline('target')
            } else {
                await app.load('target', { online: mode === 'online' })
            }
            expect(app.getState().savedFilters.active.id).toBeNull()
            if (mode !== 'online') {
                expect(app.getState().itemFilters).toEqual({})
            }
        }
    )
})
