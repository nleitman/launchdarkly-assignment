import 'dotenv/config';
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

const { LD_SDK_KEY, LD_FLAG_KEY, LD_METRIC_KEY } = process.env;

const client = LaunchDarkly.init(LD_SDK_KEY);

client.once('ready', async () => {
  const totalUsers = Number(process.env.TOTAL_USERS ?? 1000);

  for (let i = 0; i < totalUsers; i++) {

    // create a context with a unique user key
    const context = {
      kind: 'user',
      key: `sim-user-${Date.now()}-${i}`,
      plan: 'pro'   // ✅ required for flag to evaluate true
    };

    // evaluate the feature flag
    const variation = await client.variation(LD_FLAG_KEY, context, false);

    // simulate different conversion rates
    const conversionRate = variation ? 0.30 : 0.20;

    // random conversion event is tracked
    if (Math.random() < conversionRate) {
      client.track("pro_trial_click", context);
    }

    // flush users batched by 100
    if ((i + 1) % 100 === 0) await client.flush();
  }

  await client.flush();
  console.log(`Simulated ${totalUsers} pro users.`);
  await client.close();
});