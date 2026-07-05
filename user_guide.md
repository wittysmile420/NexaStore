# NexaStore User Guide

Welcome to the NexaStore Admin Dashboard! This guide is written from the perspective of an end-user (an Administrator or Staff Member) using the live web application. It will walk you through every feature and how to get the most out of the platform.

---

## 1. Getting Started: Logging In
When you first navigate to the website, you will be greeted by the Login portal.
- Enter your assigned `Username` and `Password`.
- **Quick Access**: If you are using a demo version, you can click the pre-filled "Admin" or "User" quick-access cards at the bottom of the screen to auto-fill the credentials.
- Click **Sign In**. 
- *Note: If you remain inactive for over 24 hours, the system will automatically log you out for security purposes, and you will need to sign in again.*

---

## 2. Navigating the Dashboard
Once logged in, you will see the main application shell:
- **Left Sidebar**: Your primary navigation tool. You can jump between the **Products** inventory and the **Analytics** dashboard. (If you are logged in as a standard "User", the Analytics tab will be hidden).
- **Top Header**: Displays your current page location. On the far right, you'll see a green "Live" pulse indicating that background data synchronization is active.
- **Bottom Left**: Shows your user profile and role. Click the "Logout" icon next to your name to securely end your session.

---

## 3. The Products Module (Inventory Management)
The Products page is where you will spend most of your time. It displays the entire database of products.

### Switching Views
In the top right corner, you will see two icons: a **Grid** icon and a **List** icon.
- **Grid View**: Best for visual browsing. Displays products as large, visually appealing cards with thumbnail images.
- **List View**: Best for data analysis. Displays products in a dense, spreadsheet-style table.

### Searching for Products
- Use the **Search Bar** at the top left to find specific items. 
- You can type partial words (e.g., typing "lap" will instantly filter the database to show "Laptops"). 
- *Tip*: The system waits for you to stop typing for a fraction of a second before searching, ensuring your browser doesn't slow down while you type.

### Filtering by Category
- Below the search bar is a list of category tags (e.g., Beauty, Furniture, Smartphones).
- Click a category to filter the inventory.
- **Multi-select**: You can click multiple categories at once (e.g., clicking "Smartphones" and "Laptops" will show all products that belong to *either* category). Click a highlighted category again to remove the filter. Click "All" to clear all filters.

### Sorting the Data
- Next to the search bar are sorting dropdowns: **Price**, **Rating**, and **Name**.
- Click the arrows next to these buttons to sort the currently displayed items in Ascending (low to high) or Descending (high to low) order.

### Customizing the Table (List View Only)
If you switch to the List View, a new **Columns** button appears in the top right.
- Click it to open the Column Customizer menu.
- **Hide/Show Data**: Uncheck boxes (like "Brand" or "Weight") to hide those columns from your screen, giving you a cleaner view.
- **Reorder Data**: Click and drag the six-dot icon next to any column name to move it up or down. The table will instantly rearrange itself to match your preferred layout!

### Pagination
If your search yields more than 20 results, pagination controls will appear at the bottom of the screen. Use "Previous", "Next", or click a specific page number to navigate through large inventories.

### Bookmarking your Search
Every time you search, sort, or switch pages, watch your browser's URL bar. The URL updates automatically. If you have a specific view you check daily (e.g., "Smartphones sorted by lowest price on Page 2"), you can simply bookmark that URL in your browser and jump straight to it tomorrow!

---

## 4. Product Details
Want to know more about a specific item? Click on any Product Card (in Grid view) or any Product Row (in List view).
- **Image Carousel**: The top section displays high-resolution images. It will automatically slide through the gallery every 4 seconds. You can also manually click the left/right arrows or the bottom thumbnails.
- **Inventory Status**: Badges indicate if the item is "In Stock", "Low Stock", or "Out of Stock".
- **Product Details Grid**: A quick-reference grid showing the SKU, exact weight, dimensions, warranty, and shipping rules.
- **Customer Reviews**: Scroll to the bottom to read individual customer reviews, their specific star ratings, and the date they posted the review.

---

## 5. Analytics & Reporting (Admin Only)
If you have an Admin account, click the **Analytics** tab in the sidebar. This page gives you a bird's-eye view of your business.
- **KPI Cards**: At the top, you'll see four critical metrics:
  1. Total Products in the system.
  2. The mathematical Average Rating across the entire inventory.
  3. Total Inventory Value (calculated by multiplying every item's price by its current stock).
  4. The total number of distinct Categories you sell.
- **Interactive Charts**:
  - Hover your mouse over any slice of the **Category Distribution** donut chart or the **Stock Status** pie chart to see exact product counts.
  - Hover over the bars in the **Price Distribution** or **Rating Distribution** charts to see how your inventory is distributed across different tiers.

---

## 6. Managing Inventory Visibility (Admin Only)
If a product is discontinued or temporarily unavailable, Admins have the power to hide it from standard users.
- In the Products List or Grid view, look for the **Eye Icon** on a product card or row.
- Clicking the eye icon toggles the product's visibility (`isPublished`).
- When a product is "Unpublished", standard User accounts will no longer be able to see it, search for it, or view its details, but it remains safely in the database for Admins to access and analyze.
