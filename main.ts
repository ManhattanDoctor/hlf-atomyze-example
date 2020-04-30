import { Settings } from './src/Settings';
import { Connector } from './src/Connector';
import { DefaultLogger } from '@ts-core/backend-nestjs/logger';
import { Example } from './src/Example';

async function bootstrap(): Promise<void> {
    let settings = new Settings();
    let logger = new DefaultLogger(settings.loggerLevel);

    let connector = new Connector(logger, settings);
    await connector.connect();

    let example = new Example(logger, settings);
    await example.initialize(connector);
    // await transferUSDTFromBobToAlice();
    // await transferPDTFromAliceToBob();
}

bootstrap();

/*
async function showBalances(): Promise<void> {
    for (let token of [pdt, usdt]) {
        logger.log(`Total supply: ${await token.totalSupply()} ${token.name}`);
        for (let user of [alice, bob]) {
            logger.log(`${user.name}: ${await token.balanceOf(user.address)} ${token.name}`);
        }
        console.log();
    }

    logger.log(`${usdt.name}: allowed ${await pdt.allowedBalanceOf(bob.address, usdt.name)} ${pdt.name}`);
}

async function transferUSDTFromBobToAlice(): Promise<void> {
    let amount = '100';
    if (await usdt.transfer(alice.address, amount, bob)) {
        logger.log(`${bob.name} transfered ${alice.name} ${amount} ${usdt.name}`);
    }
    console.log();
}

// Transfer PDT tokens from Alice to Bob
async function transferPDTFromAliceToBob(): Promise<void> {
    let amount = '5';
    if (await pdt.transfer(bob.address, amount, alice)) {
        logger.log(`${alice.name} transfered ${bob.name} ${amount} ${pdt.name}`);
    }
    console.log();
}

async function allowUSDTtoPDT(): Promise<void> {
    let key = '0xFF';

    let id = await usdt.swapBegin(pdt.name, '10', key, bob);
    logger.log(`${bob.name} started swap ${id}. Waiting 30 seconds...`);

    await PromiseHandler.delay(30 * DateUtil.MILISECONDS_SECOND);
    console.log(await pdt.swapDone(id, key));
    console.log();
    logger.log(`${usdt.name}: allowed ${await pdt.allowedBalanceOf(bob.address, usdt.name)} ${pdt.name}`);
}

*/
