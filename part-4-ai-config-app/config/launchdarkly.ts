
import { init, LDClient } from "@launchdarkly/node-server-sdk";
import { initAi, LDAIClient } from "@launchdarkly/server-sdk-ai";

const LD_SDK_KEY = process.env.LAUNCHDARKLY_SDK_KEY;

const ldClient: LDClient = init(LD_SDK_KEY as string);

const aiClient: LDAIClient = initAi(ldClient);
// Initialize and return the LaunchDarkly client
export const getLaunchDarklyClients = async () => {
  try {
    await ldClient.waitForInitialization({ timeout: 10 });
  } catch (err) {
    // log your error
  }
  return { ldClient, aiClient };
};

