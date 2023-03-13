import * as express from 'express';
import { AddressInfo } from 'net';

export interface DummyServer {
  url: string;
  close: () => void;
}

export const createDummyServer = async (
  registerEndpoints: (Express) => void,
): Promise<DummyServer> => {
  const app = express();
  app.use(express.json());

  registerEndpoints(app);

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({
        url: `http://localhost:${(server.address() as AddressInfo).port}`,
        close: () => server.close(),
      });
    });
  });
};
