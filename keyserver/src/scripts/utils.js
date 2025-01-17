// @flow

import { endPool } from '../database/database';
import { endFirebase, endAPNs } from '../push/providers';
import { publisher } from '../socket/redis';

function endScript() {
  endPool();
  publisher.end();
  endFirebase();
  endAPNs();
}

async function main(functions: $ReadOnlyArray<() => Promise<mixed>>) {
  try {
    for (const f of functions) {
      await f();
    }
  } catch (e) {
    console.warn(e);
  } finally {
    endScript();
  }
}

export { endScript, main };
