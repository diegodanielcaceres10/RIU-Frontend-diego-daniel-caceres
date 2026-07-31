# 🦸 RIU Frontend – SuperHero Maintenance

Technical assessment developed with **Angular 21**, implementing a complete CRUD application for superhero management following modern Angular best practices.

## ✨ Features

- ✅ Complete CRUD for superheroes
- 🔍 Real-time search by name
- 📄 Pagination with Angular Material
- 📝 Shared Create/Edit form
- 🗑️ Delete confirmation dialog
- ⚡ Angular Signals for state management
- 🔄 RxJS for asynchronous operations
- 🧪 93 unit tests with Vitest
- 🐳 Docker development environment
- 📱 Responsive interface

---

## 🛠️ Tech Stack

| Technology       | Version |
| ---------------- | ------- |
| Angular          | 21      |
| TypeScript       | Latest  |
| Angular Material | ✓       |
| RxJS             | ✓       |
| Angular Signals  | ✓       |
| Vitest           | ✓       |
| Docker           | ✓       |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── core/
│   ├── shared/
│   ├── superheroes/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   └── directives/
│   └── app.routes.ts
```

---

## 🏗️ Architecture

### State Management

The application combines the strengths of **Angular Signals** and **RxJS**.

- Signals expose reactive application state.
- Observables handle asynchronous operations.
- Read-only signals prevent unintended mutations.
- Computed signals derive filtered data efficiently.

### Data Layer

The project includes a generic `HttpService` together with an injectable `USE_MOCK_DATA` token, allowing the application to switch between mocked data and a real backend without changing the public API.

Business validations include:

- Duplicate superhero name validation
- Automatic ID generation
- Loading states
- Controlled error propagation

---

## 🎨 UI Components

- Angular Material
- MatPaginator
- MatDialog
- Reactive Forms
- Lazy Loaded routes

---

## 🚀 Getting Started

### Using Docker

```bash
docker compose up
```

### Local Development

```bash
npm ci
npm start
```

Application:

```
http://localhost:4200
```

---

## 🧪 Testing

Run all tests

```bash
npm test
```

Coverage achieved:

| Metric     | Coverage   |
| ---------- | ---------- |
| Statements | **93.9%**  |
| Branches   | **96.85%** |
| Functions  | **87.34%** |
| Lines      | **96.32%** |

A total of **93 unit tests** were implemented covering:

- Services
- CRUD operations
- Business validations
- HTTP error propagation
- Components
- Reactive forms
- Pagination
- Filtering
- Confirmation dialog
- Custom directives

---

## 📌 Technical Decisions

- Standalone Components
- Lazy Loading
- Signals + RxJS hybrid approach
- Generic HTTP abstraction
- Dependency Injection using feature flags
- Reusable confirmation dialog
- Reactive forms
- Dockerized development
- High unit test coverage

---

## 📸 Screenshots

> Add screenshots of the application here.

Example:

```
docs/
 ├── list.png
 ├── form.png
 └── delete-dialog.png
```

---

## 👨‍💻 Author

**Diego Daniel Caceres**

Senior Frontend Developer

Angular • TypeScript • RxJS • Docker • Testing
