# 🔐 Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please email **cassianomeloprofissional@gmail.com** instead of using the issue tracker.

Please include the following details:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Any suggested fixes

We take security seriously and will respond to security reports promptly.

## Security Best Practices

### JWT Configuration
- **CRITICAL**: Change the `jwt.secret` environment variable in production
- Default secret key is for development only
- Use a strong, random key (minimum 256 bits recommended)

### Environment Variables
Always set these in production:
```bash
JWT_SECRET=your-strong-secret-key-here
JWT_ACCESS_TOKEN_EXPIRATION=1800000
JWT_REFRESH_TOKEN_EXPIRATION=604800000
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/ong_db
SPRING_DATASOURCE_USERNAME=secure_username
SPRING_DATASOURCE_PASSWORD=strong_password
LOG_LEVEL=INFO
SPRING_JPA_DDL_AUTO=validate
```

### Database Security
- Never commit database credentials to version control
- Use PostgreSQL with strong passwords
- Enable SSL connections to database
- Regular backups should be encrypted

### API Security
- All endpoints require JWT authentication (except `/auth/login` and `/auth/signup`)
- CORS is configured (verify origin whitelist)
- Rate limiting is recommended for production
- Use HTTPS only in production

### Code Security
- Dependencies are regularly updated
- SonarQube/similar tools are recommended for code analysis
- All input is validated using Spring Validation
- SQL injection is prevented through JPA parameterized queries

## Dependencies Security

To check for known vulnerabilities in dependencies:
```bash
./mvnw org.owasp:dependency-check-maven:check
```

## Support Versions

- **Current Version**: 1.0.0
- **Minimum Java**: 21 LTS
- **Spring Boot**: 3.5.9+

## Security Advisories

Check this file regularly for security updates and advisories.

Last Updated: 2025-12-18
