# Client: Analytics & Details Pages

This document details the logic for transforming data for charts and managing complex UI states like image carousels.

## 1. `Analytics.jsx`
This page utilizes `recharts` to render SVG-based charts. The heavy lifting relies on `useMemo` for data transformation.

**Logic Flow**:
1. It fetches a single massive JSON object from `/api/products/analytics/summary`.
2. Recharts requires data in specific array formats (e.g., `[{ name: 'A', value: 400 }, ...]`). The backend data is close, but not exact.
3. We use `useMemo` hooks to transform the data. For example, `ratingChartData`:
   - It takes the backend buckets (`0-1`, `1-2`, etc.).
   - It maps over them, standardizing the labels and extracting the `count`.
   - By wrapping this in `useMemo`, we guarantee this array mapping only happens when the server `data` actually changes, not when the user hovers over a chart (which triggers internal Recharts re-renders).

**Tooltip Logic**:
- Recharts provides a `<Tooltip />` component, but we override it with a `CustomTooltip` function.
- `CustomTooltip` receives the active data payload on hover. We return standard HTML/CSS using our global design system variables (glassmorphism cards) to make the charts look native to the application.

## 2. `ProductDetail.jsx`
This page fetches a single product by its ID and displays a detailed view.

**Carousel Logic**:
- The state variable `currentImage` tracks the index of the active image (starts at 0).
- We extract the image array: `const images = product.images?.length ? product.images : [product.thumbnail]`. (Fallback logic: if no images array exists, fallback to the single thumbnail string).
- **Manual Navigation**: `handleNextImage` uses modulo math: `setCurrentImage(prev => (prev + 1) % images.length)`. If we are on the last image (index 3 of length 4), `(3 + 1) % 4` equals 0, instantly looping back to the first image without crashing.
- **Auto-Play**: A `useEffect` sets an interval to call `setCurrentImage` every 4 seconds. Importantly, it includes a cleanup function `clearInterval` to stop the auto-play if the user navigates away from the page, preventing background errors.

**Conditional Rendering**:
- We use defensive rendering: `if (!product) return <Loading />`. This prevents "Cannot read properties of null" errors while the fetch request is pending.
- We conditionally render the "Discount" badges and "Reviews" sections only if those arrays/values actually exist on the product object.
