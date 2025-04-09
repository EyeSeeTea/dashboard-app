import { useCachedDataQuery } from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import { connect } from 'react-redux'
import {
    acSetActiveFilter,
    acSetLoadingSavedFilters,
    tDeleteActiveFilter,
    tSaveFilter,
    tToggleActiveFilterVisibility,
} from '../../../actions/savedFilters.js'
import AlertDialog from '../../../components/AlertDialog.js'
import {
    privateVisibility,
    publicVisibility,
} from '../../../modules/savedFilters.js'
import { sGetNamedItemFilters } from '../../../reducers/itemFilters.js'
import {
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

    const [openFilterErrorAlert, setOpenFilterErrorAlert] = useState(false)

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
                        setOpenFilterErrorAlert(true)
                    }
                }
            ),
        [currentUser, toggleFilterVisibility, handleFilterAction]
    )

    const closeFilterErrorAlert = () => setOpenFilterErrorAlert(false)

    const {
        openDialogForNewFilter,
        openDialogForRename,
        filterDialogIsOpen,
        dialogProps,
    } = useSaveFitlerDialog({
        activeFilter,
        doSaveFilter,
        isLoading,
        currentUser,
    })

    return (
        online && (
            <>
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
                <AlertDialog
                    critical={true}
                    position="top"
                    open={openFilterErrorAlert}
                    title={i18n.t('Error')}
                    message={i18n.t(
                        'A filter with this name already exists as {{ visibility }}. Please rename it before changing its scope to {{ visibility }}.',
                        {
                            visibility:
                                activeFilter.visibility === privateVisibility
                                    ? publicVisibility
                                    : privateVisibility,
                        }
                    )}
                    onClose={closeFilterErrorAlert}
                />
            </>
        )
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
