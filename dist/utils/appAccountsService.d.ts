export declare class AppAccountsService {
    private static instance;
    private accountsPromise;
    static getInstance(): AppAccountsService;
    getAccounts(): Promise<any>;
}
