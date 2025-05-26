# Project Setup

## Getting Started

First, install the project dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Starts the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

The page will auto-update as you edit files.

### `npm run build`

Builds the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This creates an optimized production build of the application.

### `npm run start`

Starts the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

Runs the built application in production mode. Make sure to run `npm run build` first.

### `npm run lint`

Runs ESLint to check for code issues:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## Using Docker Compose

This project includes a Docker Compose configuration to build and run the Next.js frontend application in a containerized environment.

### Prerequisites

Before using Docker Compose, ensure the following are installed on your system:

- Docker: https://www.docker.com/
- Docker Compose: https://docs.docker.com/compose/install/

### Project Structure

Ensure your project directory has the following structure:

```
your-project/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── yarn.lock
├── public/
├── pages/
├── components/
└── ...
```

### Build the Docker Image

To build the container image with all required dependencies:

```bash
docker-compose build --no-cache
```

### Start the Application

```bash
docker-compose up
```

Once the container is running, the application will be available at:

```
http://localhost:3000
```

### Stop the Application

```bash
docker-compose down
```

### Rebuild the Container

If you make changes to dependencies (`package.json`, `yarn.lock`) or update the `Dockerfile`, rebuild the container using:

```bash
docker-compose build --no-cache
```

### Additional Notes

- Ensure `next` is listed under the `dependencies` section of your `package.json`. If it is only under `devDependencies`, it may not be available in the production container.
- The container uses `yarn start`, which calls the Next.js CLI through the `scripts` section of `package.json`. Make sure that script exists and the project has been built with `yarn build`.
- This configuration is optimized for production usage (`next start`). For development mode (`next dev`), a separate development-specific configuration is recommended.

## Global Store for validators Documentation

### Store Structure

#### Core State Properties
- `items`: CartItem[] - Array of items in the cart
- `currentCategory`: CartCategory - Active category ("restaurant", "grocery", "retail", or "pets")
- `currentStoreId`: string | null - ID of the current store (for grocery/retail/pets)
- `currentRestaurantId`: string | null - ID of the current restaurant

### Cart Item Structure

Each cart item (`CartItem`) contains:

```typescript
{
  id: string | number,       // Unique item identifier
  name: string,              // Product name
  price: number | string,    // Price (can be number or formatted string)
  image: string,             // Product image URL
  quantity: number,          // Item quantity
  storeId?: string,          // For grocery/retail/pets items
  restaurantId?: string,     // For restaurant items
  customizations?: string,   // Any customizations
  category: CartCategory     // Item category
}
```

### Example Cart State

```json
{
  "items": [
    {
      "id": "mint-mojito-iced-coffee1748271054684",
      "restaurantId": "philz-coffee",
      "name": "Mint Mojito Iced Coffee",
      "price": "7.40",
      "image": "https://img.cdn4dd.com/...",
      "customizations": "#1 · Popular Choice · Small",
      "quantity": 1,
      "category": "restaurant"
    },
    {
      "id": "turkey-sausage-sandwich",
      "restaurantId": "philz-coffee",
      "name": "Turkey Sausage Sandwich",
      "price": "$8.70",
      "image": "https://img.cdn4dd.com/...",
      "quantity": 3,
      "category": "restaurant"
    }
  ],
  "currentCategory": "restaurant",
  "currentStoreId": null,
  "currentRestaurantId": "philz-coffee"
}
```

### Viewing in Redux DevTools

The store is configured to work with Redux DevTools:

1. Install the Redux Devtools extension
2. Open DevTools (Ctrl+Shift+I or Cmd+Opt+I)
3. Select the "Redux" tab
4. Look for "CartStore" in the state tree
5. Actions will appear in the log as they occur

### Naming Convention Inconsistency

#### Current Situation
The codebase uses different naming conventions because the user flows and design specifications were provided after the core cart functionality was already implemented.

#### Mapping Reference

| User Flow Term | Implementation Field |
|----------------|---------------------|
| cart.store     | item.restaurantId   |
| cart.vendor    | item.storeId        |

This mapping should be referenced when working with cart-related functionality to ensure correct field usage.
