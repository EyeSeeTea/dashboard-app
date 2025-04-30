import { OfflineTooltip } from '@dhis2/analytics'
import { Button, Layer, Popper } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { ArrowDown, ArrowUp } from './assets/Arrow.js'
import styles from './DropdownButton.module.css'

const DropdownButton = ({
    children,
    open,
    onClick,
    disabledWhenOffline,
    component,
    showArrow = true,
    ...rest
}) => {
    const anchorRef = useRef()

    const ArrowIconComponent = open ? ArrowUp : ArrowDown
    return (
        <div ref={anchorRef} className={styles.container}>
            <OfflineTooltip disabledWhenOffline={disabledWhenOffline}>
                <Button onClick={onClick} type="button" {...rest}>
                    {children}
                    {showArrow && (
                        <ArrowIconComponent className={styles.arrow} />
                    )}
                </Button>
            </OfflineTooltip>
            {open && (
                <Layer onClick={onClick} transparent>
                    <Popper placement="bottom-start" reference={anchorRef}>
                        {component}
                    </Popper>
                </Layer>
            )}
        </div>
    )
}

DropdownButton.propTypes = {
    children: PropTypes.node.isRequired,
    component: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    disabledWhenOffline: PropTypes.bool,
    showArrow: PropTypes.bool,
}

export default DropdownButton
