# Contributing to PantryPlus

Thank you for your interest in contributing to PantryPlus! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Follow the setup instructions in [SETUP.md](./SETUP.md)
4. Create a new branch for your feature or bug fix

## Development Workflow

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`

### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example: `feat: add barcode scanner component`

### Code Style

#### TypeScript
- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` types - use specific types or `unknown`
- Use functional components with hooks

#### React
- Use functional components
- Prefer hooks over class components
- Use `'use client'` directive for client-only components
- Keep components small and focused

#### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use the existing color scheme (indigo primary)

### Testing
- Write unit tests for utility functions
- Test hooks with React Testing Library
- Test components with integration tests
- Ensure all tests pass before submitting PR

### Linting
Run before committing:
```bash
npm run lint
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update comments in code
   - Update SETUP.md for new configuration

2. **Test Your Changes**
   - Run `npm run lint`
   - Run `npm run build`
   - Test manually in browser
   - Test offline functionality

3. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes
   - List breaking changes if any

4. **Code Review**
   - Address review comments
   - Keep discussions respectful
   - Update code as needed

## Feature Suggestions

### High Priority Features
- Complete barcode scanner implementation
- Recipe API integration
- Advanced search and filtering
- Bulk operations
- Data export/import

### Medium Priority Features
- Meal planning calendar
- Nutrition information
- Price tracking
- Waste analytics
- Shopping list smart suggestions

### Future Enhancements
- Multi-user households
- Shared shopping lists
- Mobile app (React Native)
- Voice commands
- Smart home integration

## Project Structure Guidelines

### Adding New Pages
1. Create page in appropriate `app/` subdirectory
2. Add to navigation if needed
3. Implement offline support
4. Add authentication if required

### Adding New Hooks
1. Place in `lib/hooks/`
2. Follow naming convention: `use<Name>.ts`
3. Include TypeScript types
4. Add error handling
5. Document usage

### Adding New Database Tables
1. Update Dexie schema in `lib/db/dexie.ts`
2. Create corresponding Firestore collection
3. Update security rules
4. Create custom hook for operations

## Performance Guidelines

- Minimize bundle size
- Lazy load components when possible
- Optimize images
- Use proper caching strategies
- Implement virtualization for long lists

## Accessibility Guidelines

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

## Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use Firebase security rules properly
- Sanitize data before display
- Follow OWASP guidelines

## Questions?

Feel free to:
- Open an issue for bugs
- Start a discussion for questions
- Submit PRs for improvements
- Share feedback and ideas

Thank you for contributing to PantryPlus! 🎉
