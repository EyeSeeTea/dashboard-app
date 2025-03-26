import { DimensionsPanel } from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Card, colors, IconFilter24 } from '@dhis2/ui'
import isEmpty from 'lodash/isEmpty.js'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    acClearActiveModalDimension,
    acSetActiveModalDimension,
} from '../../../actions/activeModalDimension.js'
import useDimensions from '../../../modules/useDimensions.js'
import { sGetActiveModalDimension } from '../../../reducers/activeModalDimension.js'
import { sGetItemFiltersRoot } from '../../../reducers/itemFilters.js'
import { sGetActiveFilter } from '../../../reducers/savedFilters.js'
import AlertDialog from '../../AlertDialog.js'
import ConfirmActionDialog from '../../ConfirmActionDialog.js'
import DropdownButton from '../../DropdownButton/DropdownButton.js'
import FilterDialog from './FilterDialog.js'
import { useSavedFilterSelector } from './useSavedFilterSelector.js'

const FilterSelector = (props) => {
    const { isDisconnected: offline } = useDhis2ConnectionStatus()

    const {
        savedFiltersIsOpen,
        savedFilterWarningOpen,
        toggleSavedFilterIsOpen,
        getSavedFilters,
        loadingSavedFilters,
        closeWarningDialog,
        confirmWarningAction,
        openFilterWarning,
        closeFilterWarningDialog,
    } = useSavedFilterSelector(props)

    const [filterDialogIsOpen, setFilterDialogIsOpen] = useState(false)
    const dimensions = useDimensions(filterDialogIsOpen)

    const toggleFilterDialogIsOpen = () =>
        setFilterDialogIsOpen(!filterDialogIsOpen)

    const onCloseDialog = () => {
        setFilterDialogIsOpen(false)

        props.clearActiveModalDimension()
    }

    const selectDimension = (id) => {
        props.setActiveModalDimension(
            dimensions.find((dimension) => dimension.id === id)
        )
    }

    const filterDimensions = () => {
        if (!props.restrictFilters) {
            return dimensions
        } else {
            return dimensions.filter((d) =>
                [...props.allowedFilters].includes(d.id)
            )
        }
    }

    const getFilterSelector = () => (
        <Card dataTest="dashboard-filter-popover">
            <DimensionsPanel
                style={{ width: '320px' }}
                dimensions={filterDimensions()}
                onDimensionClick={selectDimension}
                selectedIds={Object.keys(props.initiallySelectedItems)}
            />
        </Card>
    )

    return props.restrictFilters && !props.allowedFilters?.length ? null : (
        <>
            <DropdownButton
                loading={loadingSavedFilters}
                dataTest="saved-filters-button"
                disabled={offline}
                secondary
                small
                open={savedFiltersIsOpen}
                onClick={toggleSavedFilterIsOpen}
                icon={<IconFilter24 color={colors.grey700} />}
                component={getSavedFilters()}
            >
                <div>
                    {loadingSavedFilters
                        ? i18n.t('Saving...')
                        : i18n.t('Saved filters')}
                </div>
            </DropdownButton>

            <DropdownButton
                secondary
                small
                open={filterDialogIsOpen}
                disabled={offline}
                onClick={toggleFilterDialogIsOpen}
                icon={<IconFilter24 color={colors.grey700} />}
                component={getFilterSelector()}
                dataTest="filter-button"
            >
                {i18n.t('Filter')}
            </DropdownButton>
            {!isEmpty(props.dimension) ? (
                <FilterDialog
                    dimension={props.dimension}
                    onClose={onCloseDialog}
                />
            ) : null}

            <ConfirmActionDialog
                position="top"
                open={savedFilterWarningOpen}
                title={i18n.t('Unsaved Changes')}
                message={i18n.t(
                    'You have unsaved changes in the "{{ filterName }}" filter. If you proceed, your changes will be lost. Would you like to continue?',
                    { filterName: props.activeFilter.name }
                )}
                cancelLabel={i18n.t('Cancel')}
                confirmLabel={i18n.t('Yes, discard changes')}
                onConfirm={confirmWarningAction}
                onCancel={closeWarningDialog}
            />
            <AlertDialog
                warning={true}
                position="top"
                open={openFilterWarning}
                title={i18n.t('Warning')}
                message={i18n.t(
                    'The selected Saved Filter cannot be applied because it includes selections that the current user does not have permission to view. Please try a different filter.'
                )}
                onClose={closeFilterWarningDialog}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
    activeFilter: sGetActiveFilter(state),
    dimension: sGetActiveModalDimension(state),
    initiallySelectedItems: sGetItemFiltersRoot(state),
})

FilterSelector.propTypes = {
    activeFilter: PropTypes.object,
    allowedFilters: PropTypes.array,
    clearActiveModalDimension: PropTypes.func,
    dimension: PropTypes.object,
    initiallySelectedItems: PropTypes.object,
    restrictFilters: PropTypes.bool,
    setActiveModalDimension: PropTypes.func,
}

export default connect(mapStateToProps, {
    clearActiveModalDimension: acClearActiveModalDimension,
    setActiveModalDimension: acSetActiveModalDimension,
})(FilterSelector)
