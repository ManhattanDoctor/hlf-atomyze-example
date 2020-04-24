import { LoggerWrapper, ILogger } from '@ts-core/common/logger';
import { FileUtil } from '@ts-core/backend/file';
import { Network, Contract, FileSystemWallet, Wallet, Gateway, InMemoryWallet, X509WalletMixin } from 'fabric-network';
import * as _ from 'lodash';
import * as FabricCAServices from 'fabric-ca-client';
import { Settings } from './Settings';

export class Connector extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private wallet: Wallet;
    private network: Network;
    private gateway: Gateway;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected settings: Settings) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async connect(): Promise<void> {
        this.debug(`Connecting to Fabric "${this.settings.fabricIdentity}"`);

        this.gateway = new Gateway();
        await this.gateway.connect(this.settings.fabricConnectionSettingsPath, {
            wallet: await this.getWallet(),
            identity: this.settings.fabricIdentity,
            discovery: { enabled: true, asLocalhost: true }
        });
    }

    public async getContract(channelName: string, chaincodeName: string): Promise<Contract> {
        this.network = await this.gateway.getNetwork(channelName);
        return this.network.getContract(chaincodeName);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async getWallet(): Promise<Wallet> {
        if (_.isNil(this.wallet)) {
            this.wallet = new InMemoryWallet();
            await this.wallet.import(
                this.settings.fabricIdentity,
                X509WalletMixin.createIdentity(
                    this.settings.fabricIdentityMspId,
                    this.settings.fabricIdentityCertificate,
                    this.settings.fabricIdentityPrivateKey
                )
            );
        }
        return this.wallet;
    }

    protected async enroll(): Promise<void> {
        this.log(`Enrolling users...`);

        let path = `${this.configDir}/connection.json`;
        let connection = await FileUtil.jsonRead<any>(path);
        let caInfo = connection.certificateAuthorities['ca.org1.example.com'];
        let caTLSCACerts = caInfo.tlsCACerts.pem;
        let ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        let wallet = new FileSystemWallet(`${this.configDir}/wallet`);
        if (!(await wallet.exists('admin'))) {
            let enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            let identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());

            await wallet.import('admin', identity);
            this.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        } else {
            this.log('Admin user "admin" already exists in wallet');
        }

        if (!(await wallet.exists('user1'))) {
            let gateway = new Gateway();
            await gateway.connect(path, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

            let ca = gateway.getClient().getCertificateAuthority();
            let adminIdentity = gateway.getCurrentIdentity();

            let secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'user1', role: 'client' }, adminIdentity);
            let enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
            let userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
            await wallet.import('user1', userIdentity);
            this.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');
        } else {
            this.log('User "user1" already exists in wallet');
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private get configDir(): string {
        return '../';
    }
}
