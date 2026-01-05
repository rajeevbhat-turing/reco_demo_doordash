## Dashdoor

Dashdoor is an RL-Gym designed to test and train AI models on food delivery platforms. It provides a controlled testing environment with end-to-end scenarios covering the complete food delivery workflow — from restaurant discovery and menu browsing to order placement, checkout, and post-order interactions. Dashdoor simulates realistic food delivery workflows to simplify and automate the validation of complex behaviors.

## Features

- **User Registration & Authentication**
  - Sign up/in
  - Multiple existing accounts tied to different task personas
  - Password reset and account management
  - Guest checkout flow

- **Restaurant Discovery & Search**
  - Browse restaurants by location, cuisine, rating
  - Search functionality with filters (price, delivery time, dietary preferences)

- **Menu Browsing & Item Selection**
  - View restaurant menus with item details, images, and prices
  - Add/remove items to cart, customize orders (e.g., toppings, instructions)

- **Order Placement & Checkout**
  - Cart management
  - Address input and validation
  - Payment integration
  - Saved payment information by task persona
  - Input new credit/debit card
  - Order confirmation and summary page

- **Order History & Reordering**
  - View past orders
  - One-click reorder functionality

- **Ratings & Reviews**
  - Customers can rate restaurants and delivery experience
  - Display aggregated ratings and reviews

## Images

Images are stored in the database as **relative paths** (e.g., `dashdoor/restaurants/98/menu_items/1.jpg`) and are dynamically prefixed with the `PREFIX_URL` environment variable at runtime. This allows flexible CDN/hosting configuration without database changes.

### Image Hosting

- **Storage**: Images are hosted on AWS S3 (default: `https://meta-ui-images.s3.us-west-2.amazonaws.com/`)
- **Database**: All image URLs in the database are relative paths
- **Runtime**: The `PREFIX_URL` environment variable is used to construct full URLs
- **Configuration**: Set `PREFIX_URL` in `.env.local` to point to your CDN or local image server

### Getting Images

The images are zipped and uploaded [here](https://meta-ui-images.s3.us-west-2.amazonaws.com/zipped_images/dashdoor_20260105_142217.zip). You can:
1. Extract the ZIP file and upload to your own S3 bucket/CDN
2. Extract locally and serve via a local server
3. Update `PREFIX_URL` to point to your image location

After setting `PREFIX_URL`, all images will load correctly.

## Local Setup

Whenever running this project, please use Docker.

### Docker Setup

To run the app using Docker, follow these steps:

1. **Build the Docker image**:

   ```sh
   docker build -f ./Dockerfile.prod -t dashdoor . --load
   ```

2. **Run the Docker container**:

   ```sh
   docker run -p 3000:3000 dashdoor
   ```

3. **Open your browser** and navigate to `localhost:3000` to see the app running.

### Docker Environment Variables

Environment variables can be overridden at **build time** or **runtime**:

#### Override at Build Time

Use `--build-arg` to set values when building the image:

```sh
docker build -f ./Dockerfile.prod -t dashdoor \
  --build-arg PREFIX_URL=https://my-cdn.cloudfront.net/ \
  --build-arg LIBSQL_URL=file:/custom/path/dashdoor.db \
  . --load
```

#### Override at Runtime

Use `-e` flag to set values when running the container:

```sh
docker run -p 3000:3000 \
  -e PREFIX_URL=https://my-cdn.cloudfront.net/ \
  -e LIBSQL_URL=file:/custom/path/dashdoor.db \
  dashdoor
```

> **Note**: Runtime values take precedence over build-time values.

## Development Setup

To set up the project for local development:

1. **Install dependencies**:

   ```sh
   npm install
   ```

2. **Set up environment variables** by copying the example file:

   ```sh
   cp .env.example .env
   ```

   The `.env.example` file contains all required environment variables with default values:

   | Variable | Description | Default |
   |----------|-------------|---------|
   | `LIBSQL_URL` | Main DashDoor database | `file:./data/db/dashdoor.db` |
   | `DELIVERY_LIBSQL_URL` | Delivery portal database | `file:./data/db/delivery.db` |
   | `MERCHANT_LIBSQL_URL` | Merchant portal database | `file:./data/db/merchant.db` |
   | `PREFIX_URL` | S3 bucket URL prefix for images | `https://meta-ui-images.s3.us-west-2.amazonaws.com/` |

   > **Note**: The default database files are located inside the `data/db` folder.

3. **Run the development server**:

   ```sh
   npm run dev
   ```

4. **Open your browser** and navigate to `localhost:3000` to see the app running.

## Environment Variables

### Database URLs

The application uses three separate SQLite databases:
- **dashdoor.db** - Main consumer app (restaurants, menu items, orders, reviews)
- **delivery.db** - Delivery partner portal (drivers, deliveries, earnings)
- **merchant.db** - Merchant portal (store management, menu management)

### Image Storage

Images are stored in the database as relative paths (e.g., `dashdoor/restaurants/1/logo/logo.jpg`). The `PREFIX_URL` environment variable is prepended to these paths to form the full URL:

```
PREFIX_URL + relative_path = full_image_url
https://meta-ui-images.s3.us-west-2.amazonaws.com/ + dashdoor/restaurants/1/logo/logo.jpg
= https://meta-ui-images.s3.us-west-2.amazonaws.com/dashdoor/restaurants/1/logo/logo.jpg
```

This allows you to switch image hosting providers by simply changing the `PREFIX_URL`.
