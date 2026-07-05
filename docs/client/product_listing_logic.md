# Client: Product Listing Logic (`Products.jsx`)

`client/src/pages/Products.jsx` is the most complex component in the application. It handles fetching, debouncing, URL state synchronization, and complex re-rendering optimizations.

## 1. URL State Synchronization
**Design Decision**: Why use URL parameters instead of `useState` for filters?
If a user filters for "Laptops", sorts by "Price (High to Low)", goes to Page 3, and then refreshes their browser, `useState` variables would reset to default. By storing state in the URL (`?category=laptops&sort=price&page=3`), the state is persistent, shareable, and bookmarkable.

**Implementation**:
- We use React Router's `useSearchParams()`.
- We read the current URL parameters into an object: `const currentParams = Object.fromEntries(searchParams)`.
- When a user changes a filter, we construct a new object, merge it with `currentParams`, and call `setSearchParams(newParams)`.

## 2. API Fetching & The Dependency Array
The `fetchProducts` function is inside a `useEffect`.
- **Dependency**: The `useEffect` depends on `[searchParams]`. This means *anytime* the URL changes, React automatically re-fires the `fetchProducts` logic. We don't need to manually call `fetchProducts()` in our click handlers; we just update the URL, and the `useEffect` reacts to it.

## 3. The `useMemo` Optimizations
In React, whenever a state changes (like typing in a search box), the entire component function re-runs from top to bottom.
- We have complex logic that extracts unique categories from the products list to populate the filter dropdown.
- Running a `.map()` and `Set()` across 200 items on every single keystroke is bad for performance.
- We wrap this logic in `useMemo()`. React will calculate the categories *once*, cache the result, and only recalculate it if the raw `products` array actually changes.

## 4. The `useCallback` Optimizations & `React.memo`
We render a grid of `<ProductCard>` components. 
- We wrapped `ProductCard` in `React.memo()` so it only re-renders if its specific props change.
- However, we pass a function to it: `<ProductCard onTogglePublish={handleTogglePublish} />`.
- In standard React, functions are re-created in memory on every render. This means `handleTogglePublish` gets a new memory address every time you type in the search bar, which breaks `React.memo`, causing all 200 cards to re-render.
- **Fix**: We wrap `handleTogglePublish` in `useCallback()`. This locks the function's memory address in place, allowing `React.memo` to do its job and drastically speeding up typing performance in the search bar.

## 5. Column Customization Logic
For the Table View, we maintain a `columns` state array.
- It is initialized with default visibility values (e.g., `id: 'price', visible: true`).
- We pass this array to the `<ColumnCustomizer />` component.
- The customizer returns the mutated array when the user clicks checkboxes or drags items.
- The table header and table rows literally map over this `columns` array. If `col.visible` is false, it returns `null` (rendering nothing). This seamlessly handles hiding/showing data dynamically.

## 6. View Mode Persistence & Responsive View Toggle
Users can toggle between Grid View and Table View.
- **Persistence**: We use `localStorage.getItem('nexastore_viewMode')` to remember the user's preference. This ensures that if they switch to Table View and refresh, it stays in Table View.
- **Responsive Override**: A `useEffect` listens to `window.addEventListener('resize', ...)` to track `isMobile` (`window.innerWidth <= 768`).
- Since Table View is not mobile-friendly due to extreme horizontal scrolling constraints, if `isMobile` becomes true, we forcibly hide the View Toggle buttons and automatically render the Grid View. We do *not* overwrite their `localStorage` preference, so if they rotate their device or move to a desktop, their Table View preference returns.

## 7. Complex Responsive Layout & Flex Blowout Prevention
The product listing grid (`.products-grid`) employs advanced CSS handling for different viewports:
- **Desktop/Tablet**: Uses `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` to create a fluid, auto-flowing grid.
- **Mobile (<480px)**: The grid is forced to a single column (`1fr`). We switch the `.product-card` to a horizontal `display: flex; flex-direction: row;` layout. This is the e-commerce standard for mobile, preventing vertical images from blowing up to fill the screen width (which happens if `aspect-ratio: 4 / 3` is used on a single full-width column).
- **Flexbox Blowout Bug Fix**: We encountered a critical CSS bug where a scrolling horizontal row of category chips (`flex-wrap: nowrap`) forced the entire HTML page to expand beyond the mobile viewport (causing the browser to zoom out and make text microscopic).
- **The Fix**: We explicitly applied `min-width: 0` to `.dashboard-main`, `.content-area`, and `.products-filters`. In Flexbox, a flex child's default minimum width is `auto` (meaning it won't shrink below the minimum size of its content). By setting `min-width: 0`, we instruct the flex containers that they are allowed to shrink smaller than their content, which successfully constrains the scrolling chip container to the physical screen width.
