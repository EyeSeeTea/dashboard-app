import { DimensionsPanel } from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Card, colors, FlyoutMenu, IconFilter24, Menu } from '@dhis2/ui'
import isEmpty from 'lodash/isEmpty.js'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    acClearActiveModalDimension,
    acSetActiveModalDimension,
} from '../../../actions/activeModalDimension.js'
import { tSelectSavedFilter } from '../../../actions/savedFilters.js'
import useDimensions from '../../../modules/useDimensions.js'
import { sGetActiveModalDimension } from '../../../reducers/activeModalDimension.js'
import { sGetItemFiltersRoot } from '../../../reducers/itemFilters.js'
import {
    privateVisiblity,
    publicVisibility,
    sGetActiveFilter,
    sGetSavedFiltersVisibilityMap,
} from '../../../reducers/savedFilters.js'
import DropdownButton from '../../DropdownButton/DropdownButton.js'
import MenuItem from '../../MenuItemWithTooltip.js'
import FilterDialog from './FilterDialog.js'
import classes from './styles/FilterSelector.module.css'

const FilterSelector = (props) => {
    const [savedFiltersIsOpen, setSavedFiltersIsOpen] = useState(false)
    const [filterDialogIsOpen, setFilterDialogIsOpen] = useState(false)
    const dimensions = useDimensions(filterDialogIsOpen || savedFiltersIsOpen)
    const { isDisconnected: offline } = useDhis2ConnectionStatus()

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

    const handleSelectSavedFilter = (filterId) => {
        props.selectSavedFilter(
            filterId === props.activeFilter.id ? null : filterId
        )
        setSavedFiltersIsOpen(false)
    }

    const hasPrivateFilters = props.privateFilters.length > 0
    const hasPublicFilters = props.publicFilters.length > 0

    const getSavedFilters = () => (
        <FlyoutMenu>
            {hasPublicFilters && (
                <Menu className={classes.selection}>
                    <span className={classes.selectionLabel}>
                        {i18n.t('Shared filters')}
                    </span>
                    {props.publicFilters.map((filter) => (
                        <MenuItem
                            key={filter.id}
                            dense
                            active={props.activeFilter.id === filter.id}
                            label={filter.name}
                            onClick={() => handleSelectSavedFilter(filter.id)}
                        />
                    ))}
                </Menu>
            )}
            {hasPrivateFilters && (
                <Menu className={classes.selection}>
                    <span className={classes.selectionLabel}>
                        {i18n.t('My filters')}
                    </span>
                    {props.privateFilters.map((filter) => (
                        <MenuItem
                            key={filter.id}
                            dense
                            active={props.activeFilter.id === filter.id}
                            label={filter.name}
                            onClick={() => handleSelectSavedFilter(filter.id)}
                        />
                    ))}
                </Menu>
            )}
        </FlyoutMenu>
    )

    return props.restrictFilters && !props.allowedFilters?.length ? null : (
        <>
            {(hasPublicFilters || hasPrivateFilters) && props.activeFilter && (
                <DropdownButton
                    dataTest="saved-filters-button"
                    secondary
                    small
                    open={savedFiltersIsOpen}
                    onClick={() => setSavedFiltersIsOpen(!savedFiltersIsOpen)}
                    icon={<IconFilter24 color={colors.grey700} />}
                    component={getSavedFilters()}
                >
                    <div>{props.activeFilter.name}</div>
                </DropdownButton>
            )}
            <DropdownButton
                secondary
                small
                open={filterDialogIsOpen}
                disabled={offline}
                onClick={toggleFilterDialogIsOpen}
                icon={<IconFilter24 color={colors.grey700} />}
                component={getFilterSelector()}
            >
                {i18n.t('Filter')}
            </DropdownButton>
            {!isEmpty(props.dimension) ? (
                <FilterDialog
                    dimension={props.dimension}
                    onClose={onCloseDialog}
                />
            ) : null}
        </>
    )
}

const mapStateToProps = (state) => ({
    dimension: sGetActiveModalDimension(state),
    initiallySelectedItems: sGetItemFiltersRoot(state),
    privateFilters: sGetSavedFiltersVisibilityMap(state)[privateVisiblity],
    publicFilters: sGetSavedFiltersVisibilityMap(state)[publicVisibility],
    activeFilter: sGetActiveFilter(state),
})

FilterSelector.propTypes = {
    activeFilter: PropTypes.object,
    allowedFilters: PropTypes.array,
    clearActiveModalDimension: PropTypes.func,
    dimension: PropTypes.object,
    initiallySelectedItems: PropTypes.object,
    privateFilters: PropTypes.array,
    publicFilters: PropTypes.array,
    restrictFilters: PropTypes.bool,
    selectSavedFilter: PropTypes.func,
    setActiveModalDimension: PropTypes.func,
}

export default connect(mapStateToProps, {
    clearActiveModalDimension: acClearActiveModalDimension,
    setActiveModalDimension: acSetActiveModalDimension,
    selectSavedFilter: tSelectSavedFilter,
})(FilterSelector)
