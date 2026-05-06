const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Auth - Password Hashing', () => {
  test('1. Password should be hashed (not stored as plain text)', async () => {
    const password = 'mySecret123';
    const hashed = await bcrypt.hash(password, 10);
    expect(hashed).not.toBe(password);
  });

  test('2. Correct password should match its hash', async () => {
    const password = 'mySecret123';
    const hashed = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hashed);
    expect(isMatch).toBe(true);
  });

  test('3. Wrong password should NOT match the hash', async () => {
    const hashed = await bcrypt.hash('correctPassword', 10);
    const isMatch = await bcrypt.compare('wrongPassword', hashed);
    expect(isMatch).toBe(false);
  });
});

describe('Auth - JWT Token', () => {
  test('4. JWT token should be created with user id and role', () => {
    const token = jwt.sign({ id: '123', role: 'Customer' }, 'secretkey');
    const decoded = jwt.verify(token, 'secretkey');
    expect(decoded.id).toBe('123');
    expect(decoded.role).toBe('Customer');
  });

  test('5. JWT verification should fail with wrong secret', () => {
    const token = jwt.sign({ id: '123' }, 'secretkey');
    expect(() => jwt.verify(token, 'wrongkey')).toThrow();
  });
});