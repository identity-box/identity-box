import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Modal } from 'semantic-ui-react';
import { ConnectorBody } from './ConnectorBody';
import PropTypes from 'prop-types';
const IdAppConnector = ({ rendezvousUrl, buttonStyling, buttonDisabled, buttonText, open, onOpen, onCancel }) => {
    return (_jsxs(Modal, { open: open, trigger: _jsx(Button, { ...buttonStyling, disabled: buttonDisabled, onClick: async () => {
                if (onOpen) {
                    await onOpen();
                }
            }, children: buttonText || 'Show QR code' }), onClose: () => {
            if (onCancel) {
                onCancel();
            }
        }, closeIcon: true, children: [_jsx(Modal.Header, { children: "Scan QRCode" }), _jsx(Modal.Content, { children: _jsx(Modal.Description, { children: _jsx(ConnectorBody, { rendezvousUrl: rendezvousUrl }) }) })] }));
};
IdAppConnector.propTypes = {
    rendezvousUrl: PropTypes.string.isRequired,
    buttonStyling: PropTypes.object,
    buttonDisabled: PropTypes.bool,
    buttonText: PropTypes.string,
    open: PropTypes.bool,
    onOpen: PropTypes.func,
    onCancel: PropTypes.func
};
export { IdAppConnector };
//# sourceMappingURL=IdAppConnector.js.map