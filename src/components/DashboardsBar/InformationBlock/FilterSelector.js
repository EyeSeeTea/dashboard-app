import { DimensionsPanel } from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Card,
    CenteredContent,
    CircularLoader,
    colors,
    FlyoutMenu,
    IconFilter24,
    Menu,
    MenuItem as Dhis2MenuItem,
} from '@dhis2/ui'
import { isEqual } from 'lodash'
import isEmpty from 'lodash/isEmpty.js'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import {
    acClearActiveModalDimension,
    acSetActiveModalDimension,
} from '../../../actions/activeModalDimension.js'
import {
    tSelectSavedFilter,
    acSetActiveFilter,
} from '../../../actions/savedFilters.js'
import useDimensions from '../../../modules/useDimensions.js'
import { sGetActiveModalDimension } from '../../../reducers/activeModalDimension.js'
import { sGetItemFiltersRoot } from '../../../reducers/itemFilters.js'
import {
    privateVisiblity,
    publicVisibility,
    sGetActiveFilter,
    sGetLoadingSavedFilters,
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

    const renderSavedFilter = (filters, label) =>
        filters.length > 0 && (
            <Menu className={classes.selection}>
                <span className={classes.selectionLabel}>{i18n.t(label)}</span>
                {filters.map(({ id, name }) => (
                    <MenuItem
                        key={id}
                        dense
                        active={props.activeFilter.id === id}
                        label={name}
                        onClick={() => handleSelectSavedFilter(id)}
                    />
                ))}
            </Menu>
        )

    const hasSavedFilter =
        props.publicFilters?.length || props.privateFilters?.length

    const getSavedFilters = () => (
        <FlyoutMenu className={classes.selectionContainer}>
            {dimensions.length === 0 ? (
                <CenteredContent>
                    <CircularLoader small />
                </CenteredContent>
            ) : (
                <>
                    {renderSavedFilter(props.publicFilters, 'Shared filters')}
                    {renderSavedFilter(props.privateFilters, 'My filters')}

                    {!hasSavedFilter && (
                        <Dhis2MenuItem
                            disabled
                            disabledWhenOffline={false}
                            dense
                            label={i18n.t('No saved filters available')}
                        />
                    )}
                </>
            )}
        </FlyoutMenu>
    )

    useEffect(() => {
        if (
            isEqual(props.initiallySelectedItems, {}) &&
            props.activeFilter.id
        ) {
            props.updateActiveFilter(null)
        }
    }, [props])

    return props.restrictFilters && !props.allowedFilters?.length ? null : (
        <>
            <DropdownButton
                loading={props.loadingSavedFilters}
                dataTest="saved-filters-button"
                disabled={offline}
                secondary
                small
                open={savedFiltersIsOpen}
                onClick={() => setSavedFiltersIsOpen(!savedFiltersIsOpen)}
                icon={<IconFilter24 color={colors.grey700} />}
                component={getSavedFilters()}
            >
                <div>
                    {props.loadingSavedFilters
                        ? i18n.t('Saving...')
                        : props.activeFilter.name}
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
    activeFilter: sGetActiveFilter(state),
    dimension: sGetActiveModalDimension(state),
    initiallySelectedItems: sGetItemFiltersRoot(state),
    loadingSavedFilters: sGetLoadingSavedFilters(state),
    privateFilters: sGetSavedFiltersVisibilityMap(state)[privateVisiblity],
    publicFilters: sGetSavedFiltersVisibilityMap(state)[publicVisibility],
})

FilterSelector.propTypes = {
    activeFilter: PropTypes.object,
    allowedFilters: PropTypes.array,
    clearActiveModalDimension: PropTypes.func,
    dimension: PropTypes.object,
    initiallySelectedItems: PropTypes.object,
    loadingSavedFilters: PropTypes.bool,
    privateFilters: PropTypes.array,
    publicFilters: PropTypes.array,
    restrictFilters: PropTypes.bool,
    selectSavedFilter: PropTypes.func,
    setActiveModalDimension: PropTypes.func,
    updateActiveFilter: PropTypes.func,
}

export default connect(mapStateToProps, {
    clearActiveModalDimension: acClearActiveModalDimension,
    updateActiveFilter: acSetActiveFilter,
    setActiveModalDimension: acSetActiveModalDimension,
    selectSavedFilter: tSelectSavedFilter,
})(FilterSelector)
