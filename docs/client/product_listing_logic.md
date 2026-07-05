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
