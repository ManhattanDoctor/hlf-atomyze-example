import { Network, Contract, Wallet, Gateway, InMemoryWallet, X509WalletMixin } from 'fabric-network';
import { TransformUtil, DateUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { IUserOptions } from '../user/UserOptions';
import { Ed25519 } from '@ts-core/common/crypto';

export class Erc20 {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected contract: Contract) {}

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async query(name: string, ...args: Array<string>): Promise<string> {
        let buffer = await this.contract.evaluateTransaction(name, ...args);
        if (_.isNil(buffer) || buffer.length == 0) {
            throw new Error(`Invalid response for "${name}" method: ${args.join(',')}`);
        }
        return buffer.toString(TransformUtil.ENCODING);
    }

    protected async request(options: IUserOptions, name: string, ...args: Array<string>): Promise<string> {
        let nonce = Date.now().toString();
        let items = [name, options.publicKey, ...args, nonce];
        let message = items.join();
        items.push(Ed25519.sign(message, options.privateKey));

        console.log(this.contract);

        let transaction = null;
        try {
            // let buffer = await transaction.submit(...items);
            let transaction = await this.contract.submitTransaction(name, ...items);
        } catch (error) {
            console.log(error);
        }

        console.log(123);
        let buffer = await transaction.submit(...items);
        if (_.isNil(buffer) || buffer.length == 0) {
            throw new Error(`Invalid response for "${name}" method: ${args.join(',')}`);
        }
        return buffer.toString(TransformUtil.ENCODING);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async transfer(address: string, amount: string, options: IUserOptions): Promise<any> {
        return this.request(options, 'transfer', address, amount);
    }

    public async totalSupply(): Promise<string> {
        return this.query('totalSupply');
    }

    public async balanceOf(address: string): Promise<string> {
        return this.query('totalSupply', ...arguments);
    }

    /*


     let content = TransformUtil.fromJSON(TransformUtil.fromClass(request.payload));
            let response = null;
            if (this.isNeedSign(command.name)) {
                let transaction = await this.contract.createTransaction(request.method);
                response = await transaction.submit(content);
            } else {
                response = await this.contract.evaluateTransaction(request.method, content);
            }


            */
}
