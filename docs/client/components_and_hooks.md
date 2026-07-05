# Client: Components & Custom Hooks

This document explains the logic behind our custom React hooks and the heavily interactive components.

## 1. Custom Hooks

### `useDebounce.js`
**The Problem**: If a user types "Rolex" very fast, React state updates 5 times ("R", "Ro", "Rol", etc.). If we fired an API request on every update, we would spam the server and cause race conditions.
**The Logic**:
- This hook takes a `value` and a `delay` (e.g., 300ms).
- Inside, it has a `useEffect` that listens to `value`.
- When `value` changes (e.g., user types "R"), it sets a `setTimeout` to update the *debounced* state in 300ms.
- **The Magic**: The `useEffect` returns a cleanup function `() => clearTimeout(timer)`. If the user types "o" before the 300ms is up, React runs the cleanup function (killing the first timer) and starts a fresh 300ms timer. The state only updates when the user completely stops typing for 300ms.

### `usePolling.js`
**The Problem**: We want real-time dashboard updates, but WebSockets are too complex for our needs.
**The Logic**:
- It takes a `callback` (a function to run) and an `interval` (how often to run it).
- Inside a `useEffect`, it sets a `setInterval(callback, interval)`.
- It returns a cleanup function `() => clearInterval(timer)` to prevent memory leaks if the component unmounts.

## 2. Interactive Components

### `ColumnCustomizer.jsx`
This component manages the visibility and order of table columns.
**Logic**:
- **Visibility**: It renders a list of checkboxes mapped from the `columns` array. Toggling a checkbox updates the local array state.
- **Drag-and-Drop**: We use HTML5 native drag-and-drop attributes: `draggable`, `onDragStart`, `onDragOver`, `onDrop`.
  - When dragging starts, we save the index of the item being dragged (`dragItem.current`).
  - When dropped over another item, we capture that target's index (`dragOverItem.current`).
  - We create a shallow copy of the columns array. We use `splice` to remove the dragged item, and `splice` again to insert it at the target index.
  - We call the `onApply` prop to send the reorganized array back up to the parent `Products.jsx` component.

### `Pagination.jsx`
**Logic**:
- Calculates `totalPages` based on the API's `total` items count divided by `limit`.
- Contains "Previous" and "Next" buttons, which are disabled if `currentPage === 1` or `currentPage === totalPages`.
- Generates an array of page numbers to render as clickable boxes. 
- *Edge Case Handled*: If there are 100 pages, we don't render 100 boxes. The logic includes calculations to render ellipses (`...`) showing only a few pages around the current active page.
