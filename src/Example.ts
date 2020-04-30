import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { Settings } from './Settings';
import { IUserCredentials, UserCredentials } from './user/UserCredentials';
import { Erc20 } from './erc20/Erc20';
import { Connector } from './Connector';
import * as _ from 'lodash';
import { DateUtil } from '@ts-core/common/util';
import { PromiseHandler } from '@ts-core/common/promise';

export class Example extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private pdt: Erc20;
    private usdt: Erc20;

    private bob: UserCredentials;
    private alice: UserCredentials;

    // --------------------------------------------------------------------------
    //
    //  Constuctor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: Settings) {
        super(logger);

        this.bob = new UserCredentials('Bob', settings.bobPrivateKey);
        this.alice = new UserCredentials('Alice', settings.alicePrivateKey);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(connector: Connector): Promise<void> {
        this.pdt = new Erc20(this.logger, 'PDT', await connector.getContract('pdtchannel', 'pdt'));
        this.usdt = new Erc20(this.logger, 'USDT', await connector.getContract('usdtchannel', 'usdt'));

        await this.showBalance(this.alice);
        await this.transferPDTFromAliceToBob('2.5');
        await this.showBalance(this.alice);
    }

    private async showBalance(user: UserCredentials): Promise<void> {
        this.log(`${user.name}`);
        for (let token of this.tokens) {
            let opposite = this.getOppositeToken(token);

            this.logFormatted(` - balance ${token.name}`, `${await token.balanceOf(user.address)} ${token.name}`);
            this.logFormatted(` - allowed ${token.name}`, `${await token.allowedBalanceOf(user.address, opposite.name)} ${opposite.name}`);
        }
        this.log('-------------------------------');
    }

    private async buyPDTFromAlice(amount: string): Promise<void> {
        if (await this.pdt.buy(amount, this.usdt.name, this.alice)) {
            this.logFormatted(`${this.alice.name} bought`, `${amount} ${this.pdt.name}`);
        }
        this.log('-------------------------------');
    }

    private async buyBackPDTFromAlice(amount: string): Promise<void> {
        if (await this.pdt.buyBack(amount, this.usdt.name, this.alice)) {
            this.logFormatted(`${this.alice.name} bought back`, `${amount} ${this.usdt.name}`);
        }
        this.log('-------------------------------');
    }

    private async allowUSDTtoPDTFromAlice(amount: string): Promise<void> {
        let key = '0xFF';

        let id = await this.usdt.swapBegin(this.pdt.name, amount, key, this.alice);
        this.logFormatted(`${this.alice.name} swap to PDT`, '5 sec waiting...');
        this.log(`Waiting 5 seconds...`);

        await PromiseHandler.delay(5 * DateUtil.MILISECONDS_SECOND);
        await this.pdt.swapDone(id, key);
        this.logFormatted(`${this.alice.name} swap to PDT`, 'Done!');
        this.log('-------------------------------');
    }

    private async transferUSDTFromAliceToBob(amount: string): Promise<void> {
        if (await this.usdt.transfer(this.bob.address, amount, this.alice)) {
            this.logFormatted(`${this.alice.name} to ${this.bob.name}`, `${amount} ${this.usdt.name}`);
        }
        this.log('-------------------------------');
    }

    private async transferPDTFromAliceToBob(amount: string): Promise<void> {
        if (await this.pdt.transfer(this.bob.address, amount, this.alice)) {
            this.logFormatted(`${this.alice.name} to ${this.bob.name}`, `${amount} ${this.pdt.name}`);
        }
        this.log('-------------------------------');
    }

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    private logFormatted(left: any, right: any): void {
        this.log(`${_.padEnd(left, 20, ' ')}${right}`);
    }

    private getOppositeToken(item: Erc20): Erc20 {
        return item === this.pdt ? this.usdt : this.pdt;
    }

    private get tokens(): Array<Erc20> {
        return [this.usdt, this.pdt];
    }
}
