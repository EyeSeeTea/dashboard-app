import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Modal,
    ModalContent,
    ModalActions,
    ButtonStrip,
    ModalTitle,
    InputField,
    SingleSelectOption,
    SingleSelectField,
} from '@dhis2/ui'
import capitalize from 'lodash/capitalize.js'
import PropTypes from 'prop-types'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { validateFilterName } from '../../../api/savedFilters.js'
import { privateVisibility } from '../../../modules/savedFilters.js'
import { sGetSavedFiltersVisibilityMap } from '../../../reducers/savedFilters.js'

const SaveFilterDialog = ({
    onCancel,
    onConfirm,
    filter = {},
    filterVisibility = [privateVisibility],
    showScope = true,
    isLoading = false,
}) => {
    const savedFilters = useSelector((state) =>
        sGetSavedFiltersVisibilityMap(state)
    )

    const [visibility, setVisibility] = useState(
        filter.visibility || privateVisibility
    )
    const [name, setName] = useState(filter.id ? filter.name : null)
    const isNameUpdated = typeof name === 'string'

    const error = useMemo(() => {
        if (isNameUpdated) {
            if (name.length < 1) {
                return {
                    error: true,
                    validationText: i18n.t(
                        'Please enter a name for the filter'
                    ),
                }
            }
            const { isValid, message } = validateFilterName(
                { name, visibility, id: filter.id },
                savedFilters[visibility]
            )
            if (!isValid) {
                return {
                    error: true,
                    validationText: message,
                }
            }
        }
        return null
    }, [name, isNameUpdated, visibility, savedFilters, filter])

    const handleVisibilityChange = ({ selected }) => {
        setVisibility(selected)
    }
    const handleNameChange = ({ value }) => {
        setName(value)
    }
    const handleConfirm = () => {
        onConfirm({ name, visibility, id: filter.id })
    }

    return (
        <Modal
            dataTest="save-filter-dialog"
            onClose={onCancel}
            small
            position="top"
        >
            <ModalTitle>{i18n.t('Save Filter')}</ModalTitle>
            <ModalContent>
                <InputField
                    type="text"
                    placeholder={i18n.t('Untitled filter')}
                    label={i18n.t('Name')}
                    value={name}
                    onChange={handleNameChange}
                    required
                    {...error}
                />
                {showScope && (
                    <SingleSelectField
                        label={i18n.t('Scope')}
                        selected={visibility}
                        onChange={handleVisibilityChange}
                    >
                        {filterVisibility.map((filter) => (
                            <SingleSelectOption
                                key={filter}
                                value={filter}
                                label={capitalize(filter)}
                            />
                        ))}
                    </SingleSelectField>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button
                        key="cancel"
                        secondary
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {i18n.t('Cancel')}
                    </Button>

                    <Button
                        key="confirm"
                        primary
                        onClick={handleConfirm}
                        loading={isLoading}
                        disabled={!!error || !isNameUpdated}
                    >
                        {isLoading ? i18n.t('Saving...') : i18n.t('Confirm')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

SaveFilterDialog.propTypes = {
    filter: PropTypes.object,
    filterVisibility: PropTypes.array,
    isLoading: PropTypes.bool,
    showScope: PropTypes.bool,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
}

export default SaveFilterDialog
