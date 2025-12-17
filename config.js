// Obfuscated configuration
const _0x1 = {
    _u1: 'aHR0cHM6Ly93ZWJza3JpbmluZy5icGpzLWtlc2VoYXRhbi5nby5pZC9za3JpbmluZw==', // URL_SCREENING
    _p1: 'L2otY2FyZS9icGpzL2FwaXMvdmVyaWZpa2FzaS9ub2thLw==', // API_VERIF
    _p2: 'L2otY2FyZS9icGpzL2FwaXMvZGV0YWlsLw==', // API_DETAIL
    _n1: 'ai1jYXJl', // APP_NAME
    _n2: 'QlBKUw==', // VENDOR_NAME
    _k1: 'YnBqcw==', // VENDOR_KEY
    _m1: 'QW5kYSBiZWx1bSBtZWxha3VrYW4gc2tyaW5pbmcga2VzZWhhdGFu' // MSG_SCREENING
};

function _d(_s) {
    return atob(_s);
}

// Export for usage
const configExport = {
    get SCREENING_URL() { return _d(_0x1._u1); },
    get API_VERIF() { return _d(_0x1._p1); },
    get API_DETAIL() { return _d(_0x1._p2); },
    get APP_NAME() { return _d(_0x1._n1); },
    get VENDOR_NAME() { return _d(_0x1._n2); },
    get VENDOR_KEY() { return _d(_0x1._k1); },
    get MSG_SCREENING() { return _d(_0x1._m1); }
};

if (typeof window !== 'undefined') {
    window.APP_CONFIG = configExport;
} else if (typeof self !== 'undefined') {
    self.APP_CONFIG = configExport;
}
