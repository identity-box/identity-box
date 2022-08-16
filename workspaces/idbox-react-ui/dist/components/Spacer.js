import { jsx as _jsx } from "react/jsx-runtime";
export const Spacer = ({ children, render, margin = 0, padding = 0 }) => {
    return (_jsx("div", { style: {
            margin,
            padding,
            boxSizing: 'border-box'
        }, children: render ? render() : children }));
};
//# sourceMappingURL=Spacer.js.map