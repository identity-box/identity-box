import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Header } from 'semantic-ui-react';
import { Centered } from '../components/Centered';
import { Spacer } from '../components/Spacer';
import { IdAppQRCode } from '../IdAppQRCode';
const ConnectorBody = ({ rendezvousUrl }) => {
    return (_jsxs(Centered, { children: [_jsx(Header, { children: "Please scan the QR code below with your mobile device." }), _jsx(Spacer, { margin: '20px 0 50px 0', render: () => _jsx(IdAppQRCode, { connectUrl: rendezvousUrl }, rendezvousUrl) })] }));
};
export { ConnectorBody };
//# sourceMappingURL=ConnectorBody.js.map