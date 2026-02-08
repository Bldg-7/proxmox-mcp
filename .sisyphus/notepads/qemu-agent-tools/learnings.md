# Validator Implementation Learnings

## Task 1: validateFilePath() and validateUsername()

### Patterns Established

1. **Type checking**: Use `typeof x !== 'string'` instead of `!x || typeof x !== 'string'` to allow empty strings to be caught by explicit empty check
   - This allows proper error differentiation between "not a string" and "empty string"

2. **Validator structure** (from existing codebase):
   - Type check first
   - Trim whitespace
   - Check for empty/whitespace-only
   - Apply length limits
   - Apply format validation
   - Return trimmed value

3. **JSDoc docstrings**: All validators include JSDoc with:
   - Brief description
   - Security constraints (if applicable)
   - Max length specification
   - @throws documentation

### validateFilePath() Implementation

- **Constraints**: 4096 char max, no ".." path traversal
- **Trimming**: Whitespace is trimmed before validation
- **Security**: Explicitly rejects ".." sequences to prevent directory traversal
- **Test coverage**: 8 test cases covering valid paths, traversal attempts, length limits, special characters

### validateUsername() Implementation

- **Format**: `/^[a-z_][a-z0-9_-]*\$?$/` (Linux username convention)
- **Constraints**: 32 char max, lowercase only, optional trailing $ for system accounts
- **Trimming**: Whitespace is trimmed before validation
- **Test coverage**: 13 test cases covering valid usernames, invalid formats, length limits, special characters

### Test Patterns

- Use `expect(() => fn()).toThrow('substring')` for error message matching
- Test both valid and invalid inputs
- Test boundary conditions (max length, empty strings)
- Test type coercion edge cases
- Test special characters and format violations

### Key Insight

The distinction between "not a string" and "empty string" is important for user feedback. Empty strings should be caught after type validation, not before.
