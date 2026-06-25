# AI API Docs

Interactive API documentation for the Azure, Mule, and Node business layers.

The site uses split OpenAPI YAML files as the source of truth, bundles them into
JSON at build time, and renders them with Scalar.

## Quick Start

```bash
npm install
npm run dev
```

Open the local Vite URL. The dev script bundles the split OpenAPI files before
starting the site.

Useful commands:

```bash
npm run docs:lint
npm run docs:bundle
npm run build
```

## Project Layout

```text
docs/
  azure/
    openapi.yaml
    paths/
    schemas/
  mule/
    openapi.yaml
    paths/
    schemas/
  node/
    openapi.yaml
    paths/
    schemas/
  shared/
    schemas/

src/
  main.tsx
  styles.css
```

Each business layer has one OpenAPI entry file:

- `docs/azure/openapi.yaml`
- `docs/mule/openapi.yaml`
- `docs/node/openapi.yaml`

Endpoint definitions live in `paths/`. Request and response models live in
`schemas/`. Models shared across business layers live in `docs/shared/schemas/`.

## Add An API

1. Pick the business layer: `azure`, `mule`, or `node`.
2. Add or edit a file under `docs/<layer>/paths/`.
3. Add any request/response models under `docs/<layer>/schemas/`.
4. Register the path and schemas in `docs/<layer>/openapi.yaml`.
5. Run `npm run docs:lint`.

Example path file:

```yaml
paths:
  /accounts/{accountId}:
    get:
      operationId: getAzureAccount
      summary: Get account profile
      description: Returns the account profile used by Azure-facing services.
      tags:
        - account
      x-category: Account Management
      parameters:
        - name: accountId
          in: path
          required: true
          schema:
            type: string
          example: acc_10001
      responses:
        '200':
          description: Account profile found.
          content:
            application/json:
              schema:
                $ref: ../schemas/Account.yaml
```

Register it in the layer entry file:

```yaml
paths:
  /accounts/{accountId}:
    $ref: ./paths/accounts.yaml#/paths/~1accounts~1{accountId}

components:
  schemas:
    Account:
      $ref: ./schemas/Account.yaml
```

For `$ref` paths, `/` inside a JSON pointer must be escaped as `~1`.

## Write Schemas

Keep schemas small and reusable. Prefer one model per file.

```yaml
type: object
required:
  - id
  - displayName
properties:
  id:
    type: string
    example: acc_10001
  displayName:
    type: string
    example: Acme Operations
```

Use `docs/shared/schemas/Error.yaml` for common error responses.

## Tags And Categories

Use `tags` for Scalar grouping and search:

```yaml
tags:
  - account
```

Use `x-category` for our own business grouping metadata:

```yaml
x-category: Account Management
```

When adding a new tag, also add it to the layer's `openapi.yaml`:

```yaml
tags:
  - name: account
    description: Account lookup and profile APIs.
```

## Authentication

The sample APIs use Bearer auth. It is defined once per business layer in
`docs/<layer>/openapi.yaml`:

```yaml
security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

Scalar will show an authentication control for Try it out requests. Do not commit
real tokens or secrets to this repository.

## Environment Configuration

The environment dropdown for Try it out requests is configured in
`src/main.tsx`.

Update the `environments` array to add, remove, or rename environments:

```ts
{
  id: 'dev',
  label: 'Development',
  description: 'Daily integration testing.',
  urlByLayer: {
    azure: 'https://dev-azure-api.acme.test',
    mule: 'https://dev-mule-api.acme.test',
    node: 'https://dev-node-api.acme.test',
  },
}
```

Each environment must provide a URL for every business layer. The selected URL is
passed to Scalar as the active OpenAPI server, so Try it out uses the selected
environment.

Browser requests must be allowed by the API server's CORS policy. If an API does
not allow browser requests, Try it out will fail even if the documentation is
correct.

## Business Layers

The business layer dropdown is configured in `src/main.tsx`:

```ts
{
  id: 'azure',
  label: 'Azure',
  description: 'Cloud gateway and platform integration APIs.',
  tags: ['account', 'document', 'identity'],
}
```

To add a new business layer, add a matching `docs/<layer>/openapi.yaml`, update
the `layers` array, and add a bundle command in `package.json`.

## Build Output

The build bundles split YAML files into JSON:

```text
public/openapi/azure.json
public/openapi/mule.json
public/openapi/node.json
```

These generated files are ignored by Git. Scalar reads them at runtime.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds and deploys the site on
every push to `main`.

Repository setup:

1. Open repository settings on GitHub.
2. Go to Pages.
3. Set the source to GitHub Actions.

The workflow runs:

```bash
npm install
npm run docs:lint
npm run build
```

## Review Checklist

Before opening a PR:

- `operationId` is unique.
- `summary` is short and readable.
- `description` explains behavior or business context.
- `tags` are present.
- Request and response schemas are referenced with `$ref`.
- Error responses use the shared `Error` schema when possible.
- `npm run docs:lint` passes.