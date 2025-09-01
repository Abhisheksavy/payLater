export declare function encrypt(text: string): {
    iv: string;
    content: string;
    tag: string;
};
export declare function decrypt(encrypted: {
    iv: string;
    content: string;
    tag: string;
}): string;
//# sourceMappingURL=crypto.d.ts.map