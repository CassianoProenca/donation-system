# 🤝 Contributing Guidelines

Thank you for your interest in contributing to the Donation System! We welcome contributions from everyone.

## How to Contribute

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/donation-system.git
cd donation-system
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### 3. Make Your Changes

#### Code Style
- Follow Java conventions and Google Java Style Guide
- Use meaningful variable names in Portuguese (consistent with codebase)
- Keep methods focused and small (<30 lines when possible)
- Add Javadoc for public methods

#### Example:
```java
/**
 * Retrieves all active products filtered by category.
 * 
 * @param categoriaId the category identifier
 * @param pageable pagination information
 * @return page of products
 * @throws ResourceNotFoundException if category not found
 */
@GetMapping("/categoria/{id}")
public ResponseEntity<Page<ProdutoDTO>> getProdutosByCategoria(
    @PathVariable Long categoriaId,
    Pageable pageable) {
    // implementation
}
```

### 4. Testing
All contributions should include tests:

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ProdutoServiceTest

# Run with coverage
./mvnw jacoco:report
```

**Minimum Coverage**: 70% of new code

### 5. Commit Messages
Use clear, descriptive commit messages:

```
feat: add product search by category
fix: resolve null pointer in lote validation
docs: update API documentation for batch endpoints
test: add tests for payment processing
chore: update dependencies to latest versions
```

Format: `<type>: <description>`

Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`

### 6. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub with:
- Clear description of changes
- Related issue numbers (if any)
- Screenshots for UI changes
- Test coverage information

## Development Setup

### Prerequisites
- Java 21 JDK
- Maven 3.8+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Local Setup
```bash
# Clone repository
git clone https://github.com/CassianoProenca/donation-system.git
cd donation-system

# Backend setup
cd backend
./mvnw clean install
./mvnw spring-boot:run

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
cd backend
docker compose up -d
```

Access API: http://localhost:8080/api/swagger-ui.html

## Project Structure

```
backend/
├── src/main/java/com/ong/backend/
│   ├── controllers/     # REST endpoints
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   ├── models/          # JPA entities
│   ├── dto/             # Data transfer objects
│   ├── security/        # Authentication & authorization
│   ├── config/          # Configuration classes
│   └── exceptions/      # Custom exceptions
├── src/test/            # Unit and integration tests
├── pom.xml              # Maven dependencies
└── docker-compose.yml   # Local environment

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── features/        # Feature-specific logic
│   ├── services/        # API client services
│   └── hooks/           # Custom React hooks
├── package.json         # npm dependencies
└── Dockerfile           # Production Docker image
```

## Code Review Checklist

Before submitting a PR, ensure:
- [ ] Code follows project style guide
- [ ] All tests pass (`./mvnw test`)
- [ ] No console errors or warnings
- [ ] Database migrations included (if needed)
- [ ] Documentation updated
- [ ] No credentials in code
- [ ] Commits are squashed (if appropriate)
- [ ] Branch is up to date with main

## API Conventions

### Response Format
```json
{
  "id": 1,
  "name": "Product Name",
  "createdAt": "2025-12-18T10:00:00Z",
  "updatedAt": "2025-12-18T10:00:00Z"
}
```

### Error Responses
```json
{
  "status": 400,
  "message": "Validation error",
  "timestamp": "2025-12-18T10:00:00Z",
  "errors": {
    "field": "Field is required"
  }
}
```

### Pagination
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "pageSize": 10
}
```

## Reporting Issues

### Bug Reports
Please include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs (if applicable)
- Your environment (OS, Java version, etc.)

### Feature Requests
Please include:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (if any)
- Related issues (if any)

## Getting Help

- 📖 [Documentation](./README.md)
- 🔐 [Security Policy](./SECURITY.md)
- 📝 [API Docs](http://localhost:8080/api/swagger-ui.html)
- 💬 [GitHub Issues](https://github.com/CassianoProenca/donation-system/issues)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
