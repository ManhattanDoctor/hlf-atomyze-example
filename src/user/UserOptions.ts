import { Ed25519 } from '@ts-core/common/crypto';
import { createHash } from 'crypto';

export class UserOptions implements IUserOptions {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected _address: string;
    protected _publicKey: string;
    protected _privateKey: string;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(privateKey: string) {
        this._privateKey = privateKey;
        this._publicKey = Ed25519.from(privateKey).publicKey;
        this._address = createHash('sha3-256')
            .update(Buffer.from(this.publicKey, 'hex'))
            .digest('hex');
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get address(): string {
        return this._address;
    }

    public get privateKey(): string {
        return this._privateKey;
    }

    public get publicKey(): string {
        return this._publicKey;
    }
}

export interface IUserOptions {
    address: string;
    publicKey: string;
    privateKey: string;
}
