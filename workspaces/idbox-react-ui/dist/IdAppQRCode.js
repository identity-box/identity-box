import { jsx as _jsx } from "react/jsx-runtime";
import { QRCodeCanvas } from 'qrcode.react';
const IdAppQRCode = ({ connectUrl, title = 'IdApp QR Code' }) => (_jsx("a", { href: connectUrl, title: title, children: _jsx(QRCodeCanvas, { value: connectUrl }) }));
export { IdAppQRCode };
//# sourceMappingURL=IdAppQRCode.js.map