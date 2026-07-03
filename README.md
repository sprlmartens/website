# Next.js + Sanity Template

A starter template for building content-driven websites with **Next.js** and **Sanity**. This template includes an embedded Sanity Studio, TypeScript support, and Sanity TypeGen for end-to-end type safety.

## Features

- ⚡ Next.js App Router
- 📝 Embedded Sanity Studio (`/studio`)
- 🔒 End-to-end TypeScript support
- 🖼️ Sanity Image URL helpers
- 📦 GROQ query type generation
- 🚀 Ready for production deployments

---

## Prerequisites

- Node.js 20+
- npm, pnpm, or yarn
- A Sanity account

---

## 1. Create a Next.js App

Create a new Next.js project:

```bash
npx create-next-app@latest
```

Follow the prompts to configure your project.

---

## 2. Initialize Sanity

From the root of your Next.js project, run:

```bash
npx sanity@latest init .
```

This command will:

- Create a new Sanity project (or connect an existing one)
- Install the required dependencies
- Configure an embedded Sanity Studio
- Generate the required configuration files

Your project structure will look similar to:

```text
.
├── .env.local
├── sanity.cli.ts
├── sanity.config.ts
├── src
│   ├── app
│   │   └── studio
│   │       └── [[...tool]]
│   │           └── page.tsx
│   └── sanity
│       ├── lib
│       │   ├── client.ts
│       │   ├── image.ts
│       │   └── live.ts
│       ├── schemaTypes
│       │   ├── authorType.ts
│       │   ├── blockContentType.ts
│       │   ├── categoryType.ts
│       │   └── postType.ts
│       ├── env.ts
│       └── schema.ts
└── ...
```

Start the development server:

```bash
npm run dev
```

Your embedded Sanity Studio will be available at:

```
http://localhost:3000/studio
```

---

## 3. Generate TypeScript Types

Sanity TypeGen generates TypeScript types from both:

- Your Studio schema
- Your GROQ queries

This provides end-to-end type safety across your application.

### Step 1: Extract your schema

```bash
npx sanity@latest schema extract --path=./src/sanity/extract.json
```

This creates a schema snapshot used by TypeGen.

---

### Step 2: Configure TypeGen

Update your `sanity.cli.ts`:

```ts
import { defineCliConfig } from "sanity/cli"

export default defineCliConfig({
  api: {
    projectId: "your-project-id",
    dataset: "your-dataset",
  },

  typegen: {
    path: "./src/**/*.{ts,tsx,js,jsx}",
    schema: "./src/sanity/extract.json",
    generates: "./src/sanity/types.ts",
  },
})
```

This configuration will:

- Scan the `src` directory for GROQ queries
- Use the extracted schema (`extract.json`)
- Generate all TypeScript definitions into:

```text
src/sanity/types.ts
```

---

### Step 3: Generate Types

Run:

```bash
npx sanity@latest typegen generate
```

Whenever you update:

- a schema type
- a GROQ query

re-run the command to regenerate the types.

---

## Automate Type Generation

To make this easier, add a script to your `package.json`:

```json
{
  "scripts": {
    "typegen": "sanity schema extract --enforce-required-fields --path=./src/sanity/extract.json && sanity typegen generate"
  }
}
```

Now you can regenerate everything with a single command:

```bash
npm run typegen
```

---

## Development Workflow

1. Create or modify your Sanity schemas.

2. Run:

   ```bash
   npm run typegen
   ```

3. Write or update your GROQ queries.

4. Enjoy fully typed query results throughout your application.

---

## Token handling and security

To access draft content your application will need to be authenticated with a token.

You can open your browser to the Manage page of your project from the command line:

```bash
npx sanity manage
```

In Manage, go to the "API" tab and create a token with "Viewer" permissions.

Update .env.local with SANITY_API_READ_TOKEN="your-new-token"

## Learn More

- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Sanity Documentation: [https://www.sanity.io/docs](https://www.sanity.io/docs)
- Sanity TypeGen: [https://www.sanity.io/docs/sanity-typegen](https://www.sanity.io/docs/sanity-typegen)

---

## License

MIT
