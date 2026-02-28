# LaunchDarkly SE Demo – Parts 1–3

This project demonstrates:

- Instant releases and rollbacks (streaming listener)
- Context-based targeting
- Server-side remediation using a kill switch trigger
- Experimentation with metrics

---

## What you need installed

- Node.js 18+
- npm
- A terminal (Mac Terminal, PowerShell, Git Bash)

---

## Directory structure

~~~
ld-assignment/
  part-1-3/
    README.md
    server.js
    package.json
    package-lock.json
    public/
    images/
    part-3-simulation/
      simulate.js
~~~

Part 4 (AI Configs) lives in `part-4-ai-config-app`.

---

## Setup

### 1. Install dependencies

From the `part-1-3` folder:

~~~
npm install
~~~

### 2. Configure environment variables

~~~
cp .env.example .env
~~~

Update `.env` with:

- SDK key
- Flag key
- Metric key (for Part 3)

---

## Run the app

~~~
node server.js
~~~

or

~~~
npm start
~~~

Visit:

~~~
http://localhost:3000
~~~

---

# Part 1 – Release and Remediate

## Goal

Wrap a feature with a boolean flag.  
Demonstrate instant release and rollback.  
Show remediation via a server-side kill switch trigger.

---

## Create the flag in LaunchDarkly

1. Go to your Project and Environment.
2. Create a Boolean feature flag.
   - Name example: `Part 1 Release and Remediate`
   - Key: `YOUR_PART1_FLAG_KEY`
3. Copy the key into `LD_FLAG_KEY` in your `.env` file.
4. Start the application and ensure the flag is turned **On** in LaunchDarkly.

<img src="./images/Create_flag.png" width="75%">

---

## Verify the banner in the app

When the context matches the flag targeting condition and the flag is On, you should see the new pricing banner appear in the app:

<img src="./images/Banner.png" width="75%">

This banner is controlled entirely by the feature flag and updates instantly when toggled.

---

## Validate release and rollback

With the app running:

- Toggle the flag Off in LaunchDarkly.
- The banner should disappear immediately (no server restart, no page reload).
- Toggle it back On to restore the banner.

This demonstrates instant release and rollback using LaunchDarkly’s streaming updates.

---

## Validate remediation (Kill Switch)

With the flag On and the banner visible:

1. Click the **Remediate: Kill Switch (server)** button in the app.
2. This simulates a production incident by forcing a server-side remediation event.
3. The feature disables immediately without restarting the server.

<img src="./images/Killswitch.png" width="75%">

This demonstrates a safe, instant rollback mechanism during an incident.

---

# Part 2 – Targeting

## Goal

Demonstrate individual and rule-based targeting using context attributes.

---

## Reuse the same flag from Part 1

For this section, continue using the same Boolean feature flag created in Part 1.

This demonstrates how a feature can move from:
- Global release
- To targeted rollout
- Without creating a new flag

No changes to `.env` are required if you are using the same flag key.

---

## Build a context in the app

Provide attributes such as:

- User key
- Email
- Plan
- Region
- Internal user flag

Use these attributes in LaunchDarkly for targeting rules.

---

## Configure targeting rules in LaunchDarkly

### Individual Targeting

Add a specific context key (example: `user-123`).

### Rule-Based Targeting

Create rules such as:

- `region equals us-east`
- `email ends with abc.com`
- `plan equals pro`

Toggle the flag and observe real-time UI updates based on the context.

---

# Part 3 – Experimentation

## Goal

Create a metric and an experiment tied to the feature flag, run the experiment, and observe statistical results.

---

## Create a Metric

1. Go to Metrics.
2. Click Create metric.
3. Choose Conversion metric.
4. Set:
   - Name example: `Part 3 Conversion`
   - Key: `YOUR_METRIC_KEY`
5. Add `LD_METRIC_KEY` to `.env`.

<p align="left">
  <img src="./images/Create_metric.png" width="75%">
</p>

---

## Create an Experiment

1. Go to Experiments.
2. Click Create experiment.
3. Select:
   - The feature flag
   - The metric
4. Configure:
   - Randomization unit: user
   - Variation split: 50 / 50

<p align="left">
  <img src="./images/Create_experiment.png" width="75%">
</p>

---

## Run the Experiment (Generate Traffic)

With the experiment running, generate traffic locally:

~~~
node ./part-3-simulation/simulate.js
~~~

This script:
- Evaluates the feature flag
- Fires the conversion metric
- Sends events to LaunchDarkly

It uses your SDK key, flag key, and metric key from `.env`.

Allow enough traffic to accumulate so statistical analysis can begin.

---

## View Experiment Results

After generating traffic, observe statistical results in LaunchDarkly.

<p align="left">
  <img src="./images/Experiment_results.png" width="75%">
</p>

---
