# LaunchDarkly SE Technical Exercise

This repository contains my implementation of the LaunchDarkly Solutions Engineer technical exercise.

The project is organized by section of the assignment to keep implementation details, setup instructions, and screenshots scoped to each part.

---

## Repository Structure

~~~
ld-assignment/
  README.md

  part-1-3/
    README.md
    images/

  part-3-simulation/
    simulate.js
    server.js
    package.json
    package-lock.json
    node_modules/
    public/

  part-4-ai-config-app/
    README.md
    package.json
    package-lock.json
    tsconfig.json

    src/
      index.ts
      shoppingAssistant.ts

    data/
    config/
    images/
    node_modules/
~~~

---

## Overview

### Part 1–3: Core Feature Flag Demo

Location:

~~~
part-1-3/
~~~

Demonstrates:

- Feature release and instant rollback
- Context-based targeting
- Server-side remediation (kill switch)
- Experiment creation and statistical analysis

See `part-1-3/README.md` for full setup and walkthrough.

---

### Part 4: AI Config App

Location:

~~~
part-4-ai-config-app/
~~~

Demonstrates usage of LaunchDarkly AI Configs.

See `part-4-ai-config-app/README.md` for setup and implementation details.

---