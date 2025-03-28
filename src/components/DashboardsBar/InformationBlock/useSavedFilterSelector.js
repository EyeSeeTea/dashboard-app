import { useCachedDataQuery } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import {
    CenteredContent,
    CircularLoader,
    FlyoutMenu,
    IconUser16,
    Menu,
    MenuItem,
    Tooltip,
} from '@dhis2/ui'
import isEqual from 'lodash/isEqual.js'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    acSetActiveFilter,
    tSelectSavedFilter,
} from '../../../actions/savedFilters.js'
import { isFilterActionAllowed } from '../../../api/savedFilters.js'
import useDimensions from '../../../modules/useDimensions.js'
import {
    sActiveFilterHasChanges,
    sGetLoadingSavedFilters,
    sGetSavedFiltersVisibilityMap,
} from '../../../reducers/savedFilters.js'
import classes from './styles/FilterSelector.module.css'

export const useSavedFilterSelector = ({
    activeFilter,
    initiallySelectedItems,
}) => {
    const dispatch = useDispatch()

    const { currentUser, rootOrgUnits } = useCachedDataQuery()
    const updateActiveFilter = (filter) => dispatch(acSetActiveFilter(filter))
    const selectSavedFilter = (filterId) =>
        dispatch(tSelectSavedFilter(filterId))
    const savedFilters = useSelector((state) =>
        sGetSavedFiltersVisibilityMap(state)
    )
    const loadingSavedFilters = useSelector((state) =>
        sGetLoadingSavedFilters(state)
    )
    const activeFilterHasChanges = useSelector((state) =>
        sActiveFilterHasChanges(state)
    )

    const [savedFilterWarningOpen, setSavedFilterWarningOpen] = useState(false)
    const [savedFiltersIsOpen, setSavedFiltersIsOpen] = useState(false)
    const [savedFilterToBeSelected, setSavedFilterToBeSelected] = useState()
    const [openFilterWarningAlert, setOpenFilterWarningAlert] = useState(false)

    const dimensions = useDimensions(savedFiltersIsOpen)
    const privateFilters = savedFilters.private
    const publicFilters = savedFilters.public

    const toggleSavedFilterIsOpen = () =>
        setSavedFiltersIsOpen(!savedFiltersIsOpen)

    const handleSelectSavedFilter = (filterId) => {
        const success = selectSavedFilter({ filterId, rootOrgUnits })
        if (success) {
            setSavedFiltersIsOpen(false)
        } else {
            setOpenFilterWarningAlert(true)
        }
    }

    const tryUpdateSelectedFilter = (filterId) => {
        setSavedFilterToBeSelected(filterId)
        if (
            activeFilterHasChanges &&
            isFilterActionAllowed({
                filter: activeFilter,
                currentUser,
                saveAsNew: true,
            })
        ) {
            setSavedFilterWarningOpen(true)
        } else {
            handleSelectSavedFilter(filterId)
        }
    }

    const renderSavedFilter = (filters, label) =>
        filters.length > 0 && (
            <Menu className={classes.selection}>
                <span className={classes.selectionLabel}>{i18n.t(label)}</span>
                {filters.map(({ id, name, userId }) => (
                    <MenuItem
                        className={classes.filterItem}
                        key={id}
                        dense
                        active={activeFilter.id === id}
                        label={
                            <div className={classes.filterItemLabel}>
                                <span className={classes.icon}>
                                    {currentUser.id === userId && (
                                        <Tooltip
                                            content={i18n.t(
                                                'You are the owner of this filter'
                                            )}
                                            placement="left"
                                        >
                                            <IconUser16 />
                                        </Tooltip>
                                    )}
                                </span>
                                {name}
                            </div>
                        }
                        onClick={() => tryUpdateSelectedFilter(id)}
                    />
                ))}
            </Menu>
        )

    const hasSavedFilter = publicFilters?.length || privateFilters?.length

    const getSavedFilters = () => (
        <FlyoutMenu className={classes.selectionContainer}>
            {dimensions.length === 0 ? (
                <CenteredContent>
                    <CircularLoader small />
                </CenteredContent>
            ) : (
                <>
                    {renderSavedFilter(publicFilters, i18n.t('Shared filters'))}
                    {renderSavedFilter(privateFilters, i18n.t('My filters'))}

                    {!hasSavedFilter && (
                        <MenuItem
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
        if (isEqual(initiallySelectedItems, {}) && activeFilter.id) {
            updateActiveFilter(null)
        }
    }, [initiallySelectedItems, activeFilter.id])

    const closeWarningDialog = () => {
        setSavedFilterWarningOpen(false)
        setSavedFiltersIsOpen(false)
    }

    const confirmWarningAction = () => {
        handleSelectSavedFilter(savedFilterToBeSelected)
        setSavedFilterWarningOpen(false)
    }

    const closeFilterWarningDialog = () => {
        setOpenFilterWarningAlert(false)
    }

    return {
        savedFiltersIsOpen,
        savedFilterWarningOpen,
        toggleSavedFilterIsOpen,
        getSavedFilters,
        loadingSavedFilters,
        closeWarningDialog,
        confirmWarningAction,
        openFilterWarning: openFilterWarningAlert,
        closeFilterWarningDialog,
    }
}
