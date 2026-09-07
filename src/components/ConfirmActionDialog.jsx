import {
    Button,
    Modal,
    ModalContent,
    ModalActions,
    ButtonStrip,
    ModalTitle,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import classes from './styles/ConfirmActionDialog.module.css'

const ConfirmActionDialog = ({
    onConfirm,
    onCancel,
    open,
    title,
    message,
    cancelLabel,
    confirmLabel,
    isLoading = false,
    position = 'middle',
}) => {
    return (
        open && (
            <Modal
                dataTest="confirm-action-dialog"
                onClose={onCancel}
                small
                position={position}
            >
                <ModalTitle>{title}</ModalTitle>
                <ModalContent>
                    <span className={classes.content}>{message}</span>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button key="cancel" secondary onClick={onCancel}>
                            {cancelLabel}
                        </Button>

                        <Button
                            key="confirm"
                            destructive
                            onClick={onConfirm}
                            loading={isLoading}
                        >
                            {confirmLabel}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        )
    )
}

ConfirmActionDialog.propTypes = {
    cancelLabel: PropTypes.string,
    confirmLabel: PropTypes.string,
    isLoading: PropTypes.bool,
    message: PropTypes.string,
    open: PropTypes.bool,
    position: PropTypes.string,
    title: PropTypes.string,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
}

export default ConfirmActionDialog
