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
}

bootstrap();