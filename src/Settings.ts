import { EnvSettingsStorage } from '@ts-core/backend/settings';
import { ILogger, LoggerLevel } from '@ts-core/common/logger';
import { AbstractSettingsStorage } from '@ts-core/common/settings';
import { IFabricApiSettings } from '@ts-core/blockchain-fabric/api';

export class Settings extends EnvSettingsStorage {
    // --------------------------------------------------------------------------
    //
    //  Public Fabric Properties
    //
    // --------------------------------------------------------------------------

    public get fabricIdentity(): string {
        return this.getValue('FABRIC_IDENTITY');
    }

    public get fabricIdentityMspId(): string {
        return this.getValue('FABRIC_IDENTITY_MSP_ID');
    }

    public get fabricIdentityPrivateKey(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('FABRIC_IDENTITY_PRIVATE_KEY'));
    }

    public get fabricIdentityCertificate(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('FABRIC_IDENTITY_CERTIFICATE'));
    }

    public get fabricConnectionSettingsPath(): string {
        return this.getValue('FABRIC_CONNECTION_SETTINGS_PATH');
    }

    // --------------------------------------------------------------------------
    //
    //  User Properties
    //
    // --------------------------------------------------------------------------

    public get usdtUserPrivateKey(): string {
        return this.getValue('USDT_USER_PRIVATE_KEY');
    }

    public get pdtUserPrivateKey(): string {
        return this.getValue('PDT_USER_PRIVATE_KEY');
    }
    
    // --------------------------------------------------------------------------
    //
    //  Logger Properties
    //
    // --------------------------------------------------------------------------

    public get loggerLevel(): LoggerLevel {
        return this.getValue('LOGGER_LEVEL', LoggerLevel.ALL);
    }
}
