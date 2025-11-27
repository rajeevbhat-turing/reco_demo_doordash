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

## Development Setup

To set up the project for local development:

1. **Install dependencies**:

   ```sh
   npm install
   ```

2. **Run the development server**:

   ```sh
   npm run dev
   ```

3. **Open your browser** and navigate to `localhost:3000` to see the app running.
