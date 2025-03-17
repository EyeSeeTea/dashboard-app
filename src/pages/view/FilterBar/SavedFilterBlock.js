import { useCachedDataQuery } from '@dhis2/analytics'
import { useAlert, useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import {
    acSetActiveFilter,
    acSetLoadingSavedFilters,
    tDeleteActiveFilter,
    tSaveFilter,
    tToggleActiveFilterVisibility,
} from '../../../actions/savedFilters.js'
import { sGetNamedItemFilters } from '../../../reducers/itemFilters.js'
import {
    privateVisibility,
    publicVisibility,
    sActiveFilterHasChanges,
    sGetActiveFilter,
    sGetLoadingSavedFilters,
} from '../../../reducers/savedFilters.js'
import { SavedFilterActions } from './SavedFilterActions.js'
import SaveFilterDialog from './SaveFilterDialog.js'
import { useSaveFitlerDialog } from './useSaveFilterDialog.js'

const SavedFilterBlock = ({
    activeFilter,
    activeFilterHasChanges,
    filters,
    isLoading,
    saveFilter,
    setLoadingSavedFilters,
    deleteFilter,
    toggleFilterVisibility,
}) => {
    const { isConnected: online } = useDhis2ConnectionStatus()
    const { currentUser } = useCachedDataQuery()
    const { show: showAlert } = useAlert(({ message }) => message, {
        critical: true,
    })

    const hasActiveSavedFilter = Boolean(activeFilter.id)

    const handleFilterAction = useCallback(
        async (actionFn) => {
            setLoadingSavedFilters(true)
            return actionFn().finally(() => setLoadingSavedFilters(false))
        },
        [setLoadingSavedFilters]
    )

    const doSaveFilter = useCallback(
        (filter = {}) =>
            handleFilterAction(() =>
                saveFilter(currentUser, { ...activeFilter, ...filter })
            ),
        [currentUser, activeFilter, saveFilter, handleFilterAction]
    )

    const doDeleteFilter = useCallback(
        () => handleFilterAction(() => deleteFilter(currentUser)),
        [currentUser, deleteFilter, handleFilterAction]
    )

    const doToggleFilterVisibility = useCallback(
        () =>
            handleFilterAction(() => toggleFilterVisibility(currentUser)).catch(
                (error) => {
                    if (error.type === 'save') {
                        showAlert({
                            message: i18n.t(
                                'A filter with this name already exists as {{ visibility }}. Please rename it before changing its scope to {{ visibility }}.',
                                {
                                    visibility:
                                        activeFilter.visibility ===
                                        privateVisibility
                                            ? publicVisibility
                                            : privateVisibility,
                                }
                            ),
                        })
                    }
                }
            ),
        [
            currentUser,
            toggleFilterVisibility,
            handleFilterAction,
            showAlert,
            activeFilter,
        ]
    )

    const {
        openDialogForNewFilter,
        openDialogForRename,
        filterDialogIsOpen,
        dialogProps,
    } = useSaveFitlerDialog({ activeFilter, doSaveFilter, isLoading })

    return (
        <>
            {online && !hasActiveSavedFilter && (
                <Button secondary small onClick={openDialogForNewFilter}>
                    {i18n.t('Save')}
                </Button>
            )}
            <SavedFilterActions
                openDialogForRename={openDialogForRename}
                openDialogForNewFilter={openDialogForNewFilter}
                doSaveFilter={doSaveFilter}
                doDeleteFilter={doDeleteFilter}
                doToggleFilterVisibility={doToggleFilterVisibility}
                activeFilter={activeFilter}
                activeFilterHasChanges={activeFilterHasChanges}
                filters={filters}
                hasActiveSavedFilter={hasActiveSavedFilter}
                currentUser={currentUser}
                isLoading={isLoading}
            />
            {filterDialogIsOpen && <SaveFilterDialog {...dialogProps} />}
        </>
    )
}

SavedFilterBlock.propTypes = {
    activeFilter: PropTypes.object.isRequired,
    activeFilterHasChanges: PropTypes.bool.isRequired,
    deleteFilter: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    saveFilter: PropTypes.func.isRequired,
    setLoadingSavedFilters: PropTypes.func.isRequired,
    toggleFilterVisibility: PropTypes.func.isRequired,
}

SavedFilterBlock.defaultProps = {
    filters: [],
}

const mapStateToProps = (state) => ({
    activeFilter: sGetActiveFilter(state),
    activeFilterHasChanges: sActiveFilterHasChanges(state),
    filters: sGetNamedItemFilters(state),
    isLoading: sGetLoadingSavedFilters(state),
})

export default connect(mapStateToProps, {
    saveFilter: tSaveFilter,
    updateActiveFilter: acSetActiveFilter,
    deleteFilter: tDeleteActiveFilter,
    setLoadingSavedFilters: acSetLoadingSavedFilters,
    toggleFilterVisibility: tToggleActiveFilterVisibility,
})(SavedFilterBlock)
