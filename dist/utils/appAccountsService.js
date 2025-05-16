class AppAccountsService {
  static instance;
  accountsPromise = null;
  // private constructor() {
  //   console.log('AppAccountsService constructor')
  // }
  static getInstance() {
    if (!AppAccountsService.instance) {
      AppAccountsService.instance = new AppAccountsService();
    }
    return AppAccountsService.instance;
  }
  getAccounts() {
    if (!this.accountsPromise) {
      this.accountsPromise = new Promise(resolve => {
        setTimeout(() => {
          if (window?.gateBridgeWallet) {
            window.gateBridgeWallet.gateAccounts().then(resolve);
          } else {
            resolve([]);
          }
        }, 1000);
      });
    }
    return this.accountsPromise;
  }
}

export { AppAccountsService };
