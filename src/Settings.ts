import { EnvSettingsStorage } from '@ts-core/backend/settings';
import { LoggerLevel } from '@ts-core/common/logger';
import { AbstractSettingsStorage } from '@ts-core/common/settings';

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

    public get bobPrivateKey(): string {
        return this.getValue('BOB_PRIVATE_KEY');
    }
    
    public get alicePrivateKey(): string {
        return this.getValue('ALICE_PRIVATE_KEY');
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