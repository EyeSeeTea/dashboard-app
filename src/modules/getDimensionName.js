import { getDimensionById, DIMENSION_ID_PERIOD } from '@dhis2/analytics'

// Period defaults can be displayed before the dimension list is fetched lazily.
export const getDimensionName = (dimensions, id) =>
    (
        dimensions.find((dimension) => dimension.id === id) ||
        (id === DIMENSION_ID_PERIOD ? getDimensionById(id) : undefined)
    ).name
