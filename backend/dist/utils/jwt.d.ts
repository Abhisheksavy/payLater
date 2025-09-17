export type JwtPayload = {
    id: string;
    email: string;
};
export declare function signAccessToken(payload: JwtPayload): string;
export declare function verifyAccessToken<T = JwtPayload>(token: string): T;
//# sourceMappingURL=jwt.d.ts.map