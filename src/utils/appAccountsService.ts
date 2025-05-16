export class AppAccountsService {
  private static instance: AppAccountsService;
  private accountsPromise: Promise<any> | null = null;

  // private constructor() {
  //   console.log('AppAccountsService constructor')
  // }

  public static getInstance(): AppAccountsService {
    if (!AppAccountsService.instance) {
      AppAccountsService.instance = new AppAccountsService();
    }
    return AppAccountsService.instance;
  }

  public getAccounts(): Promise<any> {
    if (!this.accountsPromise) {
      this.accountsPromise = new Promise((resolve) => {
        setTimeout(() => {
          if ((window as any)?.gateBridgeWallet) {
            (window as any).gateBridgeWallet.gateAccounts().then(resolve);
          } else {
            resolve([]);
          }
        }, 1000);
      });
    }
    return this.accountsPromise;
  }
}
