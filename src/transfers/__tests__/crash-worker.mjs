// Real child-process crash fixture (executed via vite-node). No PVE/SSH/network.
import { join } from 'node:path';
import { TransferJobs } from '../job-service.ts';
const [base, requestId] = process.argv.slice(-2);
const service = await TransferJobs.open({enabled:true, allowElevated:true, journalRoot:join(base,'journal'),
  uploadRoot:join(base,'in'), transferRoot:join(base,'out')}, {
  async assertUploadAvailable() {},
  async upload() {
    // The journal has committed 'transferring', but the caller has no remote receipt yet.
    process.send({id:job.id});
    await new Promise(() => {});
  },
});
const job = service.start({kind:'upload',requestId,node:'lab',storage:'local',filename:'test.iso',content:'iso'});
