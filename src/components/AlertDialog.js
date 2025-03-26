import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Modal,
    ModalContent,
    ModalActions,
    ButtonStrip,
    ModalTitle,
    IconError24,
    IconWarning24,
    IconInfo24,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import classes from './styles/AlertDialog.module.css'

const AlertDialog = ({
    open,
    title,
    message,
    closeLabel,
    onClose,
    critical,
    warning,
    position = 'middle',
}) => {
    const levelDetails = critical
        ? {
              iconClass: classes.critical,
              iconComponent: <IconError24 />,
              buttonClass: classes.criticalButton,
          }
        : warning
        ? {
              iconClass: classes.warning,
              iconComponent: <IconWarning24 />,
              buttonClass: classes.warningButton,
          }
        : {
              iconComponent: <IconInfo24 />,
          }
    return (
        open && (
            <Modal
                onClose={onClose}
                small
                position={position}
                className={classes.modal}
            >
                <ModalTitle>
                    <span className={classes.title}>
                        <span className={levelDetails.iconClass}>
                            {levelDetails.iconComponent}
                        </span>
                        {title}
                    </span>
                </ModalTitle>
                <ModalContent>
                    <span className={classes.content}>{message}</span>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button
                            key="cancel"
                            className={levelDetails.buttonClass}
                            onClick={onClose}
                        >
                            {closeLabel || i18n.t('Close')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        )
    )
}

AlertDialog.propTypes = {
    closeLabel: PropTypes.string,
    critical: PropTypes.bool,
    message: PropTypes.string,
    open: PropTypes.bool,
    position: PropTypes.string,
    title: PropTypes.string,
    warning: PropTypes.bool,
    onClose: PropTypes.func,
}

export default AlertDialog
