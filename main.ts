import { Settings } from './src/Settings';
import { Connector } from './src/Connector';
import { Erc20 } from './src/erc20/Erc20';
import { UserOptions } from './src/user/UserOptions';

async function bootstrap(): Promise<void> {
    let settings = new Settings();
    let logger = console;

    let connector = new Connector(logger, settings);
    await connector.connect();

    let pdtUser = new UserOptions(settings.pdtUserPrivateKey);
    let usdtUser = new UserOptions(settings.usdtUserPrivateKey);

    let pdt = new Erc20(await connector.getContract('pdtchannel', 'pdt'));
    let usdt = new Erc20(await connector.getContract('usdtchannel', 'usdt'));

    console.log(`Total USDT: ${await usdt.totalSupply()}`);
    console.log(`Balance USDT for usdt user: ${await usdt.balanceOf(usdtUser.address)}`);
    console.log(`Balance USDT for pdt user: ${await usdt.balanceOf(pdtUser.address)}`);

    console.log(`Total PDT: ${await pdt.totalSupply()}`);
    console.log(`Balance PDT for usdt user: ${await pdt.balanceOf(usdtUser.address)}`);
    console.log(`Balance PDT for pdt user: ${await pdt.balanceOf(pdtUser.address)}`);


    // Transfer USDT to PDT
    // await usdt.transfer(pdtUser.address, '100', usdtUser);
}

bootstrap();
