export interface Config {
    version: string;
    locale: {
        source: string;
        targets: string[];
    };
    files: {
        [key: string]: {
            include: string[];
        };
    };
    openai: {
        model: string;
    };
    instructions?: string;
}
//# sourceMappingURL=types.d.ts.map