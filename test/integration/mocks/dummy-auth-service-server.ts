import { createDummyServer, DummyServer } from './dummy-server';
// import * as userRoles from './data/user-roles.json';
import * as userRoles from './data/user-roles.json';

export const createDummyAuthServiceServer = async (): Promise<DummyServer> => {
  return createDummyServer((app) => {
    app.get('/roles/:userId', (req, res) => {
      if (req.params.userId !== 'b618445a-0089-43d5-b9ca-e6f2fc29a11d') {
        return res.status(404).send('User not found');
      }

      res.json(userRoles);
    });
  });
};
