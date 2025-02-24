import { useCachedDataQuery } from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    acSetActiveFilter,
    tDeleteActiveFilter,
    tSaveFilter,
    tToggleActiveFilterVisibility,
} from '../../../actions/savedFilters.js'
import { sGetNamedItemFilters } from '../../../reducers/itemFilters.js'
import { sGetActiveFilter } from '../../../reducers/savedFilters.js'
import { SavedFilterActions } from './SavedFilterActions.js'
import SaveFilterDialog from './SaveFilterDialog.js'
import { useSaveFitlerDialog } from './useSaveFilterDialog.js'

const SavedFilterBlock = ({
    filters,
    activeFilter,
    saveFilter,
    updateActiveFilter,
    deleteFilter,
    toggleFilterVisibility,
}) => {
    const { isConnected: online } = useDhis2ConnectionStatus()
    const { currentUser } = useCachedDataQuery()

    const hasActiveSavedFilter = Boolean(activeFilter.id)

    const doSaveFilter = useCallback(
        (filter = {}) => {
            return saveFilter(currentUser, { ...activeFilter, ...filter })
        },
        [currentUser, activeFilter]
    )

    const {
        openDialogForNewFilter,
        openDialogForRename,
        filterDialogIsOpen,
        dialogProps,
    } = useSaveFitlerDialog({ activeFilter, doSaveFilter })

    const savedFilterActionProps = useMemo(
        () => ({
            openDialogForRename,
            openDialogForNewFilter,
            doSaveFilter,
            deleteFilter,
            toggleFilterVisibility,
            activeFilter,
            filters,
            hasActiveSavedFilter,
            currentUser,
        }),
        [
            openDialogForRename,
            openDialogForNewFilter,
            doSaveFilter,
            activeFilter,
            filters,
            currentUser,
        ]
    )

    useEffect(() => {
        if (!filters.length) {
            updateActiveFilter(null)
        }
    }, [filters])

    return (
        <>
            {online && !hasActiveSavedFilter && (
                <Button secondary small onClick={openDialogForNewFilter}>
                    {i18n.t('Save')}
                </Button>
            )}
            <SavedFilterActions {...savedFilterActionProps} />
            {filterDialogIsOpen && <SaveFilterDialog {...dialogProps} />}
        </>
    )
}

SavedFilterBlock.propTypes = {
    activeFilter: PropTypes.object.isRequired,
    deleteFilter: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    saveFilter: PropTypes.func.isRequired,
    toggleFilterVisibility: PropTypes.func.isRequired,
    updateActiveFilter: PropTypes.func.isRequired,
}

SavedFilterBlock.defaultProps = {
    filters: [],
}

const mapStateToProps = (state) => ({
    filters: sGetNamedItemFilters(state),
    activeFilter: sGetActiveFilter(state),
})

export default connect(mapStateToProps, {
    saveFilter: tSaveFilter,
    updateActiveFilter: acSetActiveFilter,
    deleteFilter: tDeleteActiveFilter,
    toggleFilterVisibility: tToggleActiveFilterVisibility,
})(SavedFilterBlock)
