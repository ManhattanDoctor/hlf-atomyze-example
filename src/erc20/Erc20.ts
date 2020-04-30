import { Contract } from 'fabric-network';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { IUserCredentials } from '../user/UserCredentials';
import { Ed25519 } from '@ts-core/common/crypto';
import { LoggerWrapper, ILogger } from '@ts-core/common/logger';
import { createHash } from 'crypto';

export class Erc20 extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, public name: string, private contract: Contract) {
        super(logger, name);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async query(name: string, ...args: Array<string>): Promise<string> {
        return this.parseResponse(await this.contract.evaluateTransaction(name, ...args));
    }

    private async request(user: IUserCredentials, name: string, ...args: Array<string>): Promise<string> {
        let nonce = Date.now().toString();
        let items = [name, user.publicKey, ...args, nonce];
        let message = items.join('');
        items.push(Ed25519.sign(message, user.privateKey));

        items.shift();
        return this.parseResponse(await this.contract.submitTransaction(name, ...items));
    }

    private parseResponse(buffer: Buffer): string {
        return _.isNil(buffer) || buffer.length == 0 ? '' : buffer.toString(TransformUtil.ENCODING);
    }

    // --------------------------------------------------------------------------
    //
    //  Invoke Methods
    //
    // --------------------------------------------------------------------------

    public async swapBegin(token: string, toTokenChannel: string, amount: string, key: string, user: IUserCredentials): Promise<string> {
        let hash = createHash('sha3-256')
            .update(Buffer.from(key))
            .digest('hex');
        return this.request(user, 'swapBegin', token, toTokenChannel, amount, hash);
    }

    public async swapDone(id: string, key: string): Promise<void> {
        await this.contract.submitTransaction('swapDone', id, key);
    }

    public async buy(amount: string, token: string, user: IUserCredentials): Promise<boolean> {
        return (await this.request(user, 'buyToken', amount, token)) === 'true';
    }

    public async buyBack(amount: string, token: string, user: IUserCredentials): Promise<boolean> {
        return (await this.request(user, 'buyBack', amount, token)) === 'true';
    }

    public async transfer(address: string, amount: string, user: IUserCredentials): Promise<boolean> {
        return (await this.request(user, 'transfer', address, amount)) === 'true';
    }

    // --------------------------------------------------------------------------
    //
    //  Query Methods
    //
    // --------------------------------------------------------------------------

    public async getRate(token: string): Promise<number> {
        return Number(await this.query('getRate', token));
    }

    public async balanceOf(address: string): Promise<number> {
        return Number(await this.query('balanceOf', address));
    }

    public async allowedBalanceOf(address: string, token: string): Promise<number> {
        return Number(await this.query('allowedBalanceOf', address, token));
    }

    public async totalSupply(): Promise<number> {
        return Number(await this.query('totalSupply'));
    }
}
