import { getDashboardDefaultFilters } from '../defaultFilters.js'

describe('dashboard default filters', () => {
    const dashboard = { id: 'dashboard1' }
    const configuration = { dashboard1: { pe: [{ id: 'TODAY' }] } }

    it.each([
        ['TODAY', 'Today'],
        ['YESTERDAY', 'Yesterday'],
        ['LAST_MONTH', 'Last month'],
        ['THIS_WEEK', 'This week'],
        ['LAST_7_DAYS', 'Last 7 days'],
    ])(
        'builds a relative %s selection with its library display label',
        (id, name) => {
            expect(
                getDashboardDefaultFilters(
                    { dashboard1: { pe: [{ id }] } },
                    dashboard
                )
            ).toEqual({ pe: [{ id, name }] })
        }
    )

    it.each([
        undefined,
        null,
        {},
        { dashboard1: { pe: [] } },
        { dashboard1: { pe: [{ id: 'INVALID' }] } },
        { dashboard1: { pe: [{ id: '20261014' }] } },
        { dashboard1: { pe: [{ id: 'toString' }] } },
        { dashboard1: { pe: [null] } },
        { dashboard1: { pe: [{}] } },
        { dashboard1: { pe: [{ id: 123 }] } },
        { dashboard1: { pe: 'TODAY' } },
        { dashboard1: { pe: [{ id: 'TODAY' }, { id: 'TODAY' }] } },
    ])('ignores invalid or absent configuration: %p', (value) => {
        expect(getDashboardDefaultFilters(value, dashboard)).toEqual({})
    })

    it('does not apply defaults to another dashboard, embedded dashboards, or disallowed periods', () => {
        expect(
            getDashboardDefaultFilters(configuration, { id: 'other' })
        ).toEqual({})
        expect(
            getDashboardDefaultFilters(configuration, {
                ...dashboard,
                embedded: {},
            })
        ).toEqual({})
        expect(
            getDashboardDefaultFilters(configuration, {
                ...dashboard,
                restrictFilters: true,
                allowedFilters: ['ou'],
            })
        ).toEqual({})
        expect(
            getDashboardDefaultFilters(configuration, {
                ...dashboard,
                restrictFilters: true,
                allowedFilters: ['pe'],
            })
        ).toHaveProperty('pe')
    })
})
